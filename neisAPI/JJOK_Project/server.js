process.env.timeZone = "Asia/Seoul";
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const express = require('express');
const http = require("http");
const app = express();
const view = require('./router/view')
const schedule = require('./router/schedule')
const meal = require('./router/meal')
const community = require('./router/community')
const tip = require('./router/tip')
const hot_advice = require('./router/hot_advice')
const signup = require('./router/signup')
const register = require('./router/register')
const server = http.createServer(app);
const port = 8080;
const hostname = '127.0.0.1';
const neis = require("neis");
const fs = require("fs");

app.set('view engine', 'ejs'); 
app.engine('html', require('ejs').renderFile);
app.use('/static', express.static('static'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/view', view);
app.use('/schedule', schedule);
app.use('/meal', meal);
app.use('/community', community);
app.use('/tip', tip);
app.use('/hot_advice', hot_advice);
app.use('/signup', signup);
app.use('/register', register);

let date = new Date();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let LastDate = new Date(
    year,
    month
    , 0
);
let array = new Array();
let meal_array = new Array();
let sum = 0;

function MakeJsonToMeal(meal_year, meal_month) {
    const school = neis.createSchool(neis.REGION.BUSAN, "C100000450", neis.TYPE.HIGH);
    school.getMeal(meal_year, meal_month).then(d => {
        d.forEach(meal => {
            day = meal.date.getDate();
            meal_array.push({
                [day]: [
                    { '조식': neis.removeAllergy(meal.breakfast) },
                    { '중식': neis.removeAllergy(meal.lunch) },
                    { '석식': neis.removeAllergy(meal.dinner) }
                ]
            });
        });
        const json = {
            "School_Meal":
                meal_array
        };
        const JsonArray = JSON.stringify(json)
            fs.writeFileSync(`./${meal_year}_${meal_month}_School_Meal.json`, JsonArray, 'utf8');
        meal_array = [];
    });
}

function MakeJsonToSchedule(year_schedule, month_schedule) {
    neis.createSchool(neis.REGION.BUSAN, 'C100000450', neis.TYPE.HIGH).getDiary(month_schedule, year_schedule).then(list => {
        for (let i = 1; i <= LastDate.getDate(); i++) {
            if (list[i] != null) {
                array.push({ "일정" : list[i] });
            }
            else {
                array.push({ "일정" : '비어있음.' });
            }
        }
        const json = {
            "Schedule_Day":
                array
        };
        const JsonArray = JSON.stringify(json)
            fs.writeFileSync(`./${year_schedule}_${month_schedule}_Schedule.json`, JsonArray, 'utf8');
        array = [];
    });
}

MakeJsonToSchedule(year, month);
MakeJsonToMeal(year, month);


app.get('/', (req, res) => {
    res.render('index.html');
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});