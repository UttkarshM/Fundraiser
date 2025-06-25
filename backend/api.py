from flask import Flask,jsonify
import flask_cors


from utils import WebScraper
from utils import Model_Hindi
app = Flask(__name__)
from flask_cors import CORS
CORS(app)

model = Model_Hindi()


@app.route('/fetch/<company>', methods = ["GET"])
def fetch_articles(company:str):
    try:
        Obj : WebScraper = WebScraper()
        articles = Obj.get_html(Obj.get_articles(company))
        
        # Get the result from model processing
        result = model.process_articles(articles,company)
        
        # If the result is already a dict/JSON object, return it directly
        # If it's a string (error case), wrap it in Response field
        if isinstance(result, dict):
            return jsonify(result), 200
        else:
            return jsonify({"Response": str(result)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000,debug=True)


 