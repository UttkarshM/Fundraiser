#web scrapping
from pathlib import Path
from bs4 import BeautifulSoup
from requests_html import HTML, HTMLSession

# for ai models
from transformers import VitsModel, AutoTokenizer
import torch
import scipy
import scipy.io.wavfile
import numpy as np
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from datetime import datetime


load_dotenv()  
api_key = os.getenv("GEMINI_API_KEY")


class WebScraper:
    def __init__(self):
        self.session = HTMLSession()
        self.base_url = "https://economictimes.indiatimes.com"
        self.urls = []

    def get_articles(self, company):
        i = 0
        response = self.session.get(self.base_url + "/topic/" + company)
        parser = BeautifulSoup(response.text, 'html.parser')
        
        content_divs = parser.find_all("div", class_="clr flt topicstry story_list")
        
        if content_divs:
            for div in content_divs:
                self.urls.extend([self.base_url+a['href'] for a in div.find_all('a', href=True)])
                i+=1
                if i > 10:
                    break
                
        return self.urls

    
    def get_html(self, urls):
        articles : list = []
        for i in urls:
            try:
                response = self.session.get(i)
                
                parser = BeautifulSoup(response.text,'html.parser')
                content = parser.find_all("div",class_="pageContent flt")
                if content:
                    article_text = content[0].get_text(strip=True) 
                    # Only add articles with substantial content
                    if article_text and len(article_text.strip()) > 100:
                        articles.append(article_text)
            except Exception as e:
                print(f"Error scraping URL {i}: {e}")
                continue

        return articles

class Model_Hindi:
    def __init__(self): 
        
        self.model_speech = VitsModel.from_pretrained("facebook/mms-tts-hin")
        self.tokenizer_speech = AutoTokenizer.from_pretrained("facebook/mms-tts-hin")
        self.waveform = ""

        genai.configure(api_key=api_key)
        
        self.model_gemini = genai.GenerativeModel('gemini-2.0-flash')
    def convert(self, input):    
        try:
            inputs = self.tokenizer_speech(input, return_tensors="pt")    
            with torch.no_grad():
                output = self.model_speech(**inputs).waveform
            
            waveform = output.float().numpy()
            return self.save_as_a_waveform(waveform=waveform)
        except Exception as e:
            return "Failed to generate the waveform"
        
    def save_as_a_waveform(self, waveform, file_path=None):
        try:
            # Create wav directory if it doesn't exist
            wav_dir = "wav"
            if not os.path.exists(wav_dir):
                os.makedirs(wav_dir)
            
            # Generate unique filename if not provided
            if file_path is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                file_path = f"wav/sentiment_audio_{timestamp}.wav"
            
            sampling_rate = self.model_speech.config.sampling_rate
            scipy.io.wavfile.write(file_path, rate=sampling_rate, data=waveform.T)

            return f"Audio saved to {file_path}"
        except Exception as e:
            return f"Failed to save audio: {str(e)}"
        
    def hindi_to_english(self,input):
        prompt = f"""
        Convert the following text into Hindi:
            {input}
            <translated_sentence>.
        """
        response = self.model_gemini.generate_content(contents=prompt)
        return response.text
    def save_report_to_file(self, data, filename, is_hindi=False):
        """Save report data to a file in the reports folder"""
        try:
            # Create reports directory if it doesn't exist
            reports_dir = "reports"
            if not os.path.exists(reports_dir):
                os.makedirs(reports_dir)
            
            file_path = os.path.join(reports_dir, filename)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
            
            return file_path
        except Exception as e:
            print(f"Error saving report: {e}")
            return None
    
    def translate_report_to_hindi(self, english_report):
        """Translate the entire report to Hindi"""
        try:
            # Convert the JSON report to a readable format for translation
            report_text = json.dumps(english_report, indent=2, ensure_ascii=False)
            
            prompt = f"""
            Translate the following JSON report to Hindi while maintaining the JSON structure. 
            Translate all text content including summaries, sentiment analysis, and descriptions but keep the JSON keys in English.
            
            Report to translate:
            {report_text}
            
            Return the translated report in the same JSON format with Hindi text content.
            """
            
            response = self.model_gemini.generate_content(prompt)
            
            try:
                response_text = response.text.strip()
                if "```json" in response_text:
                    response_text = response_text[7:-3].strip()
                
                hindi_report = json.loads(response_text)
                return hindi_report
            except json.JSONDecodeError:
                # If translation fails, return original with a note
                english_report["Translation_Error"] = "Failed to translate to Hindi"
                return english_report
                
        except Exception as e:
            print(f"Error translating to Hindi: {e}")
            english_report["Translation_Error"] = str(e)
            return english_report

    def process_articles(self, articles, company):
        # Validate articles input
        if not articles or len(articles) == 0:
            return {
                "Company": company,
                "Articles": [],
                "Comparative Sentiment Score": {
                    "Sentiment Distribution": {
                        "Positive": 0,
                        "Neutral": 0,
                        "Negative": 0
                    }
                },
                "Coverage Differences": [],
                "Topic Overlap": {
                    "Common Topics": "No articles found",
                    "Unique Topics in Article n": "No articles available"
                },
                "Final Sentiment Analysis": f"No articles found for {company}. Please check if the company name is correct or if articles are available.",
                "Error": "No articles to analyze",
                "Audio File": "No audio generated - no content to analyze"
            }
        
        # Filter out empty or very short articles
        valid_articles = [article for article in articles if article and len(article.strip()) > 50]
        
        if not valid_articles:
            return {
                "Company": company,
                "Articles": [],
                "Comparative Sentiment Score": {
                    "Sentiment Distribution": {
                        "Positive": 0,
                        "Neutral": 0,
                        "Negative": 0
                    }
                },
                "Coverage Differences": [],
                "Topic Overlap": {
                    "Common Topics": "No valid articles found",
                    "Unique Topics in Article n": "Articles too short or empty"
                },
                "Final Sentiment Analysis": f"Articles found for {company} were too short or empty to analyze meaningfully.",
                "Error": "No valid articles to analyze",
                "Audio File": "No audio generated - no valid content to analyze"
            }
        
        prompt = f"""
            Perform the following tasks for the given articles about {company}:
            1. Summarize each article in one sentence.
            2. Perform sentiment analysis for each article (Positive, Negative, or Neutral).
            3. Provide the Number of Positive, Negative, or Neutral in the Comparative Sentiment Score.
            4. Compare each article with the others and highlight similarities and differences and add them to the Coverage Difference list.
            5. Provide an overall sentiment analysis for all articles combined and elaborate on why it is so.

            Articles:
            {valid_articles}

            IMPORTANT: Return ONLY a valid JSON response in the exact format below. Do not include any explanatory text before or after the JSON.

            {{
                "Company": "{company}",
                "Articles": [
                    {{
                        "Title": "Article title here",
                        "Summary": "One sentence summary here",
                        "Sentiment": "Positive/Negative/Neutral"
                    }}
                ],
                "Comparative Sentiment Score": {{
                    "Sentiment Distribution": {{
                        "Positive": 0,
                        "Neutral": 0,
                        "Negative": 0
                    }}
                }},
                "Coverage Differences": [
                    {{
                        "Similarities": "Description of similarities between articles",
                        "Differences": "Description of differences between articles"
                    }}
                ],
                "Topic Overlap": {{
                    "Common Topics": "Common topics across articles",
                    "Unique Topics in Article n": "Unique topics in specific articles"
                }},
                "Final Sentiment Analysis": "Overall sentiment analysis explanation"
            }}
        """
        
        response = self.model_gemini.generate_content(prompt)
        
        try:
            response_text = response.text

            response_text = response_text.strip()
            if "```json" in response_text:
                response_text = response_text[7:-3].strip() #removes the starting '''json and '''

            result = json.loads(response_text)
            
            # Add timestamp and metadata
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            result["Generated_At"] = datetime.now().isoformat()
            result["Timestamp"] = timestamp
            
            # Generate audio file
            result["Audio File"] = self.convert(self.hindi_to_english(result["Final Sentiment Analysis"]))
            
            # Save English report
            english_filename = f"{company}_report_english_{timestamp}.json"
            english_file_path = self.save_report_to_file(result, english_filename)
            
            # Translate to Hindi and save
            hindi_report = self.translate_report_to_hindi(result)
            hindi_filename = f"{company}_report_hindi_{timestamp}.json"
            hindi_file_path = self.save_report_to_file(hindi_report, hindi_filename, is_hindi=True)
            
            # Add file paths to the result
            result["Report_Files"] = {
                "English_Report": english_file_path,
                "Hindi_Report": hindi_file_path
            }
            
            return result
        except json.JSONDecodeError as e:
            # Return a properly formatted error response as JSON
            return {
                "Company": company,
                "Articles": [],
                "Comparative Sentiment Score": {
                    "Sentiment Distribution": {
                        "Positive": 0,
                        "Neutral": 0,
                        "Negative": 0
                    }
                },
                "Coverage Differences": [],
                "Topic Overlap": {
                    "Common Topics": ""
                },
                "Final Sentiment Analysis": f"Failed to parse the AI response: {e}. Raw response: {response_text[:200]}...",
                "Error": str(e)
            }
        except Exception as e:
            # Return a properly formatted error response as JSON
            return {
                "Company": company,
                "Articles": [],
                "Comparative Sentiment Score": {
                    "Sentiment Distribution": {
                        "Positive": 0,
                        "Neutral": 0,
                        "Negative": 0
                    }
                },
                "Coverage Differences": [],
                "Topic Overlap": {
                    "Common Topics": ""
                },
                "Final Sentiment Analysis": f"Failed to process articles: {e}",
                "Error": str(e)
            }
        

# Obj = WebScraper()
# model = Model_Hindi()

# print(model.process_articles(Obj.get_html(Obj.get_articles("nvidia")),"nvidia"))