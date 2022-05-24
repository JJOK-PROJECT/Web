process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const School = require('school-kr');
const school = new School();
var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    let month_req = req.query.month;
    let year_req = req.query.year;
    let LastDate = new Date(
        year_req,
        month_req,
        0
    )
    // 학교 검색 및 첫 번째 결과의 학교 코드로 초기화
    const example_schedule = async function () {
    // 학교 검색 및 첫 번째 결과의 학교 코드로 초기화
    const result = await school.search(School.Region.BUSAN, '부산소프트웨어마이스터고등학교');
    school.init(School.Type.HIGH, School.Region.BUSAN, result[0].schoolCode);
    if(month_req > 2) {
        const optionCalendar = await school.getCalendar({
            year: year_req,
            month: month_req,
            default: '일정 없는 날',
            separator: '\n',
        });
        const json = {
            "Schedule_Day": optionCalendar
        }
        res.render('schedule', { data: json, day: LastDate.getDate() })
    }
    else {
        const optionCalendar = await school.getCalendar({
            year: year_req,
            month: month_req,
            default: '겨울방학',
            separator: '\n',
        });
        const json = {
            "Schedule_Day": optionCalendar
        }
        res.render('schedule', { data: json, day: LastDate.getDate() })
    }
    
    
};

example_schedule();
});

module.exports = router;