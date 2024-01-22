from flask import Flask, request, jsonify, render_template
from flask_restful import reqparse, abort, Api, Resource
import requests
from urllib.parse import urlparse
from urllib.parse import parse_qs
import os
from flask_cors import CORS, cross_origin
from utils import column_to_letter

from dotenv import load_dotenv
from datetime import datetime

import pymongo
from pymongo.server_api import ServerApi
import json
import re
from bson import json_util

# load_dotenv('.env')

MAIN_SHEETNAME = os.getenv("MAIN_SHEET_NAME")
git_client_id = os.getenv("GITHUB_CLIENT_ID")
git_client_secret = os.getenv("GITHUB_CLIENT_SECRET")
mongo_client = pymongo.MongoClient(os.getenv("MONGODB_CONNECTION_STRING"), server_api=ServerApi('1'), connectTimeoutMS=20000)
db = mongo_client[os.getenv("MONGODB_DB_NAME")]
app = Flask(__name__)
cors = CORS(app, resources={r"*": {"origins": "*"}}, supports_credentials=True)
api = Api(app)
def parse_json(data):
    return json.loads(json_util.dumps(data))

def push_to_sheet(sheetName, studentName, gitUrl, attempts, timeTaken, questionColumn, timespentColumn):
    url = (
        f"https://script.google.com/macros/s/{os.getenv('SHEET_APPSCRIPT_DEPLOYMENT')}/exec"
        + f"?sheetName={sheetName}&studentName={studentName}&gitUrl={gitUrl}&attempts={attempts}&timeTaken={timeTaken}&questionColumn={questionColumn}&timespentColumn={timespentColumn}"
    )
    requests.get(url, timeout=100)

@app.route("/api/platform", methods=["GET", "OPTIONS"])
# @cross_origin(supports_credentials=True)
def get_platforms():
    platforms = db.Questions.find().distinct("Platform")

    response = {"status": 200, "platforms": platforms}

    return jsonify(response)


@app.route("/api/platform/<platform>/question", methods=["GET", "OPTIONS"])
# @cross_origin(supports_credentials=True)
def get_questions(platform):
    questions = [
        parse_json(question)
        for question in db.Questions.find(
            {"Platform": re.compile(platform, re.IGNORECASE)}
        )
    ]

    response = {"status": 200, "questions": questions}

    return jsonify(response)


@app.route("/api", methods=["POST", "OPTIONS"])
# @cross_origin(supports_credentials=True)
def api():
    json = request.json

    attribs = [
        "studentName",
        "attempts",
        "timeTaken",
        "gitUrl",
        "questionUrl",
        "platform",
    ]
    for atr in attribs:
        if atr not in json:
            return f"{atr} not found", 400
        
    student = db.People.find_one({"Name": json["studentName"]})
    question = db.Questions.find_one({"URL": json["questionUrl"]})

    if not student:
        return "Student not found", 400
    if not question:
        return "Question not found", 400
    

    interaction = {
        "Column": question["Column"],
        "Group": student["Group"],
        "ID": f"{student['Name']} | {question['Column']}",
        "Sheet": question["Sheet"],
        "Number of Attempts": json["attempts"],
        "Person": student["Name"],
        "Question_fkey": question["ID"],
        "Time Spent": json["timeTaken"],
        "update_timestamp": datetime.now(),
    }

    db.Interactions.insert_one(interaction)
    questionColumn = column_to_letter(question["Column"])
    timespentColumn = column_to_letter(question["Column"] + 1)

    push_to_sheet( 
        question["Sheet"], 
        json["studentName"], 
        json["gitUrl"],
        json["attempts"],
        json["timeTaken"],
        questionColumn,
        timespentColumn,
    )
    return jsonify({"status": "OK"})


@app.route("/authenticate")
def authenticate():
    github_auth_code = request.args.get("code")

    response = requests.post(
        "https://github.com/login/oauth/access_token",
        data={
            "client_id": git_client_id,
            "client_secret": git_client_secret,
            "code": github_auth_code,
        },
    )

    try:
        if response.status_code == 200:
            parsed_response = urlparse(f"?{response.text}")
            access_token = parse_qs(parsed_response.query)["access_token"][0].strip()
            return render_template(
                "index.html",
                access_token=access_token,
                success=True,
                message="Successfully authenticated!",
            )
        else:
            return render_template(
                "index.html",
                access_token=access_token,
                success=False,
                message="Authentication failed!",
            )
    except:
        return render_template(
            "index.html",
            access_token=access_token,
            success=False,
            message="Authentication failed!",
        )


@app.route("/")
def home():
    return jsonify(f"Attached to sheet '{os.getenv('MAIN_SHEET_NAME')}'")

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
    return response

# if __name__ == "__main__":
#     app.run()
