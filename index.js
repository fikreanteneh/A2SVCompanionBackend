import cors from 'cors';
import * as dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';
import { columnToLetter } from './utils.js';

dotenv.config();

const MAIN_SHEETNAME = process.env.MAIN_SHEET_NAME;
const gitClientId = process.env.GITHUB_CLIENT_ID;
const gitClientSecret = process.env.GITHUB_CLIENT_SECRET;

const mongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING);
let db;



const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ message: `Attached to sheet '${process.env.MAIN_SHEET_NAME}'` });
});

app.get('/api/platform', async (req, res) => {
    const platforms = await db.collection('Questions').distinct('Platform');
    const response = { status: 200, platforms: platforms };
    res.json(response);
});

app.get('/api/platform/:platform/question', async (req, res) => {
    const platform = req.params.platform;
    const questionsCursor = await db.collection('Questions').find({ Platform: platform });
    const questions = await questionsCursor.toArray();
    res.json(questions);
});

app.get('/authenticate', async (req, res) => {
    const githubAuthCode = req.query.code;

    const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: gitClientId,
            client_secret: gitClientSecret,
            code: githubAuthCode,
        })
    });

    if (response.ok) {
        const parsedResponse = url.parse(`?${await response.text()}`);
        const accessToken = querystring.parse(parsedResponse.query)["access_token"][0].trim();
        res.render('index', { access_token: accessToken, success: true, message: "Successfully authenticated!" });
    } else {
        res.render('index', { access_token: null, success: false, message: "Authentication failed!" });
    }
});


app.post('/api', async (req, res) => {
    const json = req.body;
    const attribs = [
        "studentName",
        "attempts",
        "timeTaken",
        "gitUrl",
        "questionUrl",
        "platform",
    ];

    for (let atr of attribs) {
        if (!(atr in json)) {
            res.status(400).send(`${atr} not found`);
            return;
        }
    }

    const student = await db.collection('People').findOne({ Name: json.studentName });
    const question = await db.collection('Questions').findOne({ URL: json.questionUrl });
    if (!student) {
        res.status(400).send('Student not found');
        return;
    }
    if (!question) {
        res.status(400).send('Question not found');
        return;
    }

    const interaction = {
        Column: question.Column,
        Group: student.Group,
        ID: `${student.Name} | ${question.Column}`,
        Sheet: question.Sheet,
        'Number of Attempts': json.attempts,
        Person: student.Name,
        Question_fkey: question.ID,
        'Time Spent': json.timeTaken,
        update_timestamp: new Date(),
    };

    await db.collection('Interactions').insertOne(interaction);

    const questionColumn = columnToLetter(question.Column);
    const timespentColumn = columnToLetter(question.Column + 1);

    const sheetName = question.Sheet;
    const studentName = json.studentName;
    const gitUrl = json.gitUrl;
    const attempts = json.attempts;
    const timeTaken = json.timeTaken;

    const url = `https://script.google.com/macros/s/${process.env.SHEET_APPSCRIPT_DEPLOYMENT}/exec?sheetName=${sheetName}&studentName=${studentName}&gitUrl=${gitUrl}&attempts=${attempts}&timeTaken=${timeTaken}&questionColumn=${questionColumn}&timespentColumn=${timespentColumn}`;

    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
});


const starter = async () => { 
    await mongoClient.connect();
    db = mongoClient.db(process.env.MONGODB_DB_NAME);
    console.log(db)
    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
}


starter();