import * as dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';
import { columnToLetter } from './utils.js';
// import ejs from 'ejs';
dotenv.config();

const MAIN_SHEETNAME = process.env.MAIN_SHEET_NAME;
const gitClientId = process.env.GITHUB_CLIENT_ID;
const gitClientSecret = process.env.GITHUB_CLIENT_SECRET;


let db;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

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


app.post('/api/student', async (req, res) => {
    const students = req.body.data;
    for (let student of students) {
        if (!student.Email || !student.Name) {
            res.status(400).send("Some Students Doesn't Have Email or Name.");
            return;        }
    }
    let promises = students.map(student => db.collection('People').updateOne(
        { Email: student.Email }, 
        { $set: student },
        { upsert: true }
    ));
    let existingStudents = await Promise.all(promises);
    res.json({ "Students": existingStudents });
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

    const data = await response.text()
    const [key, access_token] = data.split('&')[0].split('=')
    if (key === "access_token") {       
        return res.render("index", {
            access_token: access_token,
            success: true,
            message: "Successfully authenticated!"
        })
    } else {
        return res.render("index", {
            access_token: null,
            success: false,
            message: "Access token not found in GitHub response. Try again!"
        });
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

    const student = await db.collection('People').findOne({ Email: json.studentName });
    const question = await db.collection('Questions').findOne({ URL: json.questionUrl });
    if (!student) {
        res.status(400).send('Student not found in database');
        return;
    }
    if (!question) {
        res.status(400).send('Question not found in database');
        return;
    }

    const interaction = {
        Column: question.Column,
        Group: student.Group,
        ID: `${student.Email} | ${question.Sheet} | ${question.Column}`,
        Sheet: question.Sheet,
        NumberOfAttempts: json.attempts,
        Person: student.Name,
        Question_fkey: question.ID,
        TimeSpent: json.timeTaken,
        update_timestamp: new Date(),
    };

    await db.collection('Interactions').updateOne(
        { ID: `${student.Email} | ${question.Sheet} | ${question.Column}`}, 
        { $set: interaction },
        { upsert: true }
    );

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
    console.log("Connecting to MongoDB" );
    if (!process.env.MONGODB_CONNECTION_STRING) {
        throw new Error("MONGODB_CONNECTION_STRING not found");
    }
    const mongoClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING);

    await mongoClient.connect();
    db = mongoClient.db(process.env.MONGODB_DB_NAME);
    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
}

starter();