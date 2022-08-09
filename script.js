function makeRequest(contestId, subId, firstCode, handle){
    let link = `http://127.0.0.1:5000/get-sub?subId=${subId}&conId=${contestId}`;
    let x = new XMLHttpRequest();
    x.open("GET", link, false);
    let code = '';
    x.onload = function () {
        code = ParseCode(x.responseText);
        if (code === firstCode){
            let links = document.getElementById('links');
            let linkOnTasks = 'https://codeforces.com/contest/' + contestId + '/participant/' + handle;
            links.insertAdjacentHTML('beforeend',
                `<p><a href="${linkOnTasks}">Link</a></p>`);
        }
    }
    x.send(null);
}

///http://127.0.0.1:5000/get-sub?subId=167447007&conId=1713
let ParseCode = (responseText) => {
    let str = responseText;
    let start = str.indexOf('0.5em;">', 0) + 8;
    let preCode = '';
    for(let i = start; i < str.length; i++){
        if(str[i] == '<' && str[i + 1] == '/' && str[i + 2] == 'p' && str[i + 3] == 'r' && str[i + 4] == 'e'){
            break;
        }
        else{
            preCode += str[i];
        }
    }
    return deleteSymbols(MakeNormalCode(preCode));
}

let ParseSubmitID = (responseText) => {
    let str = responseText;
    let start = str.indexOf('submission/', 0);
    let id = '';
    for(let i = start + 11; i <= start + 50; i++){
        if(str[i] === '"'){
            break;
        }
        else{
            id += str[i];
        }
    }
    return id;
}

let CheckPos = (str, ind, Normal, Charcode) => {
    for(let i in Charcode) {
        if (ind == str.indexOf(Charcode[i], ind)) {
            return i;
        }
    }
    return -1;
}

let MakeNormalCode = (preCode) => {
    let CharCode = ['&lt;', '&gt;', '&quot;', '&amp;', '&apos;', '&#39;'];
    let Normal = ['<', '>', `"`, '&', `'`, `'`]; // 0..5
    // 4 : &lt; &gt;
    // 5 : &amp; &#39;
    // 6 : &quot; &apos;
    let str = preCode;
    let code = '';
    for(let i = 0; i < str.length; i++){
        let ind = CheckPos(str, i, Normal, CharCode);
        if(ind != -1) {
            code += Normal[ind];
            i+= CharCode[ind].length-1;
        }
        else {
            code += str[i];
        }
    }
    return code;
}

async function getApiHacks(contestId, taskId, requiredTest, firstCode) {
    let apiLink = 'https://codeforces.com/api/contest.hacks?contestId=' + contestId;
    let response = await fetch(apiLink);
    let json = await response.json();

    findZ(requiredTest, taskId, contestId, firstCode, json.result);
}

let deleteSymbols = (str) =>{
    let s = '';
    let mas = ['\t', '\n', '\r', ' '];
    for(let i in str) {
            let flag = 0;
            for(let j in mas) {
                if (str.indexOf(mas[j], i) == i) {
                    flag = 1;
                }
            }
            if(flag === 0){
                s += str[i];
            }
    }
    return s;
}

function makeRequestHack(contestId, hackId, firstCode, handle){
    let link = `http://127.0.0.1:5000/get-hack?hackId=${hackId}&conId=${contestId}`;
    let x = new XMLHttpRequest();
    let code = '';
    x.open("GET", link, false);
    x.onload = function () {
        code = ParseSubmitID(x.responseText);
        makeRequest(contestId, code, firstCode, handle);
    }
    x.send(null);
}

let findZ = (requiredTest, taskId, contestId, firstCode, json) => {
    let links = document.getElementById('links');
    links.innerHTML = '<p>Links:</p>';
    let numb = 0;
    for (let i in json) {
        if (json[i].verdict === 'HACK_SUCCESSFUL' && json[i].problem.index === taskId) {
            let solution = json[i].judgeProtocol.protocol;
            let index = solution.indexOf('Input:') + 7;
            let test = '';

            for (let j = index; j < solution.indexOf('Output:'); j++) {
                if (solution[j] !== ' ' && solution[j] !== '\n' && solution[j] !== '\r') {
                    test += solution[j];
                }
            }
            if (test === requiredTest) {
                let hackId = json[i].id;
                let handle = json[i].defender.members[0].handle;
                makeRequestHack(contestId, hackId, firstCode, handle);
            }
        }
    }
    console.log('Find');
}

let GetLinks = () => {
    console.log('Start');
    let form = document.forms[0].elements;
    let str = form[0].value;
    let task = str[str.length - 1];
    let contest = str.slice(0, str.length - 1);
    getApiHacks(contest, task, trimTask(form[1].value), deleteSymbols(form[2].value));
}

let trimTask = (requiredTest) => {
    let buff = '';
    for (let i in requiredTest) {
        if (requiredTest[i] !== ' ') {
            buff += requiredTest[i];
        }
    }
    return buff;
}