const express = require('express');
const app = express();
require('dotenv').config();
const request = require('request')

const key = process.env.KEY
const date = new Date();
const month = ('0' + (date.getMonth() + 1)).slice(-2);
const today = `${date.getFullYear()}${month}${date.getDate()}`
console.log(today);
let json_arr = Array()


app.get('/api/school/neisAPI/timeline', (req,res) => {
    const grade = req.query.grade;
    const classs = req.query.classs
    const API_URL = `https://open.neis.go.kr/hub/hisTimetable?KEY=${key}&type=json&pindex=1&size=10&ATPT_OFCDC_SC_CODE=C10&SD_SCHUL_CODE=7150658&ALL_TI_YMD=${today}&GRADE=${grade}&CLASS_NM=${classs}`;
    request(API_URL, function (error, response, body) {
        if (error) {
            console.log(error)
        }
        let obj = JSON.parse(body)
        if(JSON.stringify(obj).length === 58) {
            console.log('하하')
            return res.json({"massage" : 'no timetable'})
        }
        for (let i = 0; i < obj.hisTimetable[1].row.length; i++) {
            json_arr.push({
                'time': obj.hisTimetable[1].row[i].PERIO,
                'study': obj.hisTimetable[1].row[i].ITRT_CNTNT
            })
        }
        res.send(json_arr)
    })
})

app.listen(8888, () => console.log('dfsafdsd'))