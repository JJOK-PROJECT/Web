process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const express = require('express');
const http = require("http");
const app = express();
const server = http.createServer(app);
const port = 8080;
const hostname = '127.0.0.1';
const School = require('school-kr');
const school = new School();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 학교 검색 및 첫 번째 결과의 학교 코드로 초기화
const example_schedule = async function (year, month) {
    // 학교 검색 및 첫 번째 결과의 학교 코드로 초기화
    const result = await school.search(School.Region.BUSAN, '부산소프트웨어마이스터고등학교');
    school.init(School.Type.HIGH, School.Region.BUSAN, result[0].schoolCode);
    if (month > 2) {
        const optionCalendar = await school.getCalendar({
            year: year,
            month: month,
            default: '일정 없는 날',
            separator: '\n',
        });
        const json = {
            "Schedule_Day": optionCalendar
        }
        return json
    }
    else {
        const optionCalendar = await school.getCalendar({
            year: year,
            month: month,
            default: '겨울방학',
            separator: '\n',
        });
        const json = {
            "Schedule_Day": optionCalendar
        }
        return json
    }
};

app.get('/api/school/neisAPI/schedule', (req, res) => {
    let month_req = req.query.month;
    let year_req = req.query.year;
    example_schedule(year_req, month_req)
    .then((response) => {
        res.json(response);
    })
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});