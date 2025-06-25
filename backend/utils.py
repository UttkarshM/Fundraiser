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
    
    def write_to_file(self,data, filename="nvidia_articles.txt"):
        my_file = Path("nvidia_articles.txt")
        type = "w"
        if my_file.is_file():
            type = "a"
        with open(filename, type, encoding="utf-8") as f:
            f.write(data)
            f.write("\n")
    
    def get_html(self, company="nvidia"):
        articles : list = []
        for i in self.urls:
            response = self.session.get(i)
            
            parser = BeautifulSoup(response.text,'html.parser')
            content = parser.find_all("div",class_="pageContent flt")
            if content:
                article_text = content[0].get_text(strip=True) 
                articles.append(article_text)
                # self.write_to_file(article_text)

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
        
    def save_as_a_waveform(self, waveform, file_path="wav/final_sentiment.wav"):
        try:
            sampling_rate = self.model_speech.config.sampling_rate
            scipy.io.wavfile.write(file_path, rate=sampling_rate, data=waveform.T)

            return f"Audio saved to {file_path} data={waveform.T}"
        except Exception as e:
            return "Failed to save"
        
    def hindi_to_english(self,input):
        prompt = f"""
        Convert the following text into Hindi:
            {input}
            <translated_sentence>.
        """
        response = self.model_gemini.generate_content(contents=prompt)
        return response.text
    def process_articles(self, articles, company):
        prompt = f"""
            Perform the following tasks for the given articles about {company}:
            1. Summarize each article in one sentence.
            2. Perform sentiment analysis for each article (Positive, Negative, or Neutral).
            3. Provide the Number of Positive, Negative, or Neutral in the Comparative Sentiment Score.
            3. Compare each article with the others and highlight similarities and differences and add them to the Coverage Difference list.
            4. Provide an overall sentiment analysis for all articles combined and elaborate on why it is so.


            Articles:
            {articles}

            Return the results in the following JSON format:
            {{
                "Company": "{company}",
                "Articles": [
                    {{
                        "Title": "<title>",
                        "Summary": "<summary>",
                        "Sentiment": "<sentiment>",
                    }}
                ],
                "Comparative Sentiment Score":{{
                    "Sentiment Distribution": {{
                        "Positive":<number-positives>
                        "Neutral":<number-neutrals> 
                        "Negative":<number-negatives>
                    }}
                }}

                "Coverage Differences": [
                {{
                    "Similarities": "<similarities>",
                    "Differences": "<differences>"
                }}],
                "Topic Overlap":{{
                    "Common Topics":"<common-topics>",
                    "Unique Topics in Article n":"<unique-topics>"
                }},
                "Final Sentiment Analysis": "<overall_sentiment>"
            }}
        """
        
        response = self.model_gemini.generate_content(prompt)
        
        try:
            response_text = response.text

            response_text = response_text.strip()
            if "```json" in response_text:
                response_text = response_text[7:-3].strip() #removes the starting '''json and '''

            result = json.loads(response_text)
            result["Audio File"] = self.convert(self.hindi_to_english(result["Final Sentiment Analysis"]))
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