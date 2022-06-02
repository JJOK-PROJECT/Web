process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const School = require('school-kr');
let school = new School();

const example = async function () {
    let date = new Date();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let LastDate = new Date(
        year,
        month,
        0
    )
    let array = new Array();
    let breakfast = new Array();
    let lunch = new Array();
    let dinner = new Array();
    let meal_array = new Array();
    // 학교 검색 및 첫 번째 결과의 학교 코드로 초기화
    const result = await school.search(School.Region.BUSAN, '부산소프트웨어마이스터고등학교');
    school.init(School.Type.HIGH, School.Region.BUSAN, result[0].schoolCode);

    const optionMeal = await school.getMeal({
        year: year,
        month: month,
        default: '급식이 없는 날',
    });
    for (let i = 0; i < LastDate.getDate(); i++) {
        let key = i + 1;
        array.push(optionMeal[key].replace(/([1-9]|1[0-9])\./gi, ""));
    }
    for (let i = 0; i < LastDate.getDate(); i++) {
        if (array[i] != '급식이 없는 날') {
            breakfast.push(array[i].substr(array[i].indexOf('[조식]'), array[i].indexOf('[중식]')))
            if (array[i].indexOf('[석식]') != -1) // 석식이 있다면
            {
                lunch.push(array[i].substring(array[i].indexOf('[중식]'), array[i].indexOf('[석식]')));
            } else { // 없다면
                lunch.push(array[i].substring(array[i].indexOf('[중식]')));
            }
            dinner.push(array[i].substr(array[i].indexOf('[석식]')))
        }
        else {
            breakfast.push(array[i]);
            lunch.push(array[i]);
            dinner.push(array[i]);
        }
    }

    for (let i = 0; i < LastDate.getDate(); i++) {
        meal_array.push({
            [i + 1]: [
                { '조식': breakfast[i] },
                { '중식': lunch[i] },
                { '석식': dinner[i] }
            ]
        });
    }

    const json = {
        'School_Meal': meal_array
    }
    let key = 1;
    console.log(json.School_Meal[1].key[0].조식)

};


example();