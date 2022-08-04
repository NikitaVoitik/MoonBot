async function getApiHacks(contestId, taskId, requiredTest){
    const apiLink = 'https://codeforces.com/api/contest.hacks?contestId=' + contestId;
    const response = await fetch(apiLink);
    let json = await response.json();
    findZ(requiredTest, taskId, contestId, json.result);
}

async function getApiSubmissions(contestId, taskId, handle) {
    const apiLink = `https://codeforces.com/api/contest.status?contestId=${contestId}&handle=${handle}&from=1&count=20`;
    const response = await fetch(apiLink);
    let json = await response.json();
    json = json.result;
    checkTrueSolutions(taskId, contestId, handle, json)
}


const findZ = (requiredTest, taskId, contestId, json) =>{
    const links = document.getElementById('links');
    links.innerHTML = '<p>Links:</p>';
    for(let i in json){
        if (json[i].verdict === 'HACK_SUCCESSFUL' && json[i].problem.index === taskId){
            const solution = json[i].judgeProtocol.protocol;
            const index = solution.indexOf('Input:', 0) + 7;
            let test = '';
            for(let j = index; solution[j] !== 'O'; j++){
                if (solution[j] !== ' ' && solution[j] !== '\n' && solution[j] !== '\r'){
                    test+= solution[j];
                }
            }
            if (test === requiredTest){
                //https://codeforces.com/contest/891/participant/balakrishnan
                const author = json[i].defender.members[0].handle;
                getApiSubmissions(contestId, taskId, author);
            }
        }
    }
}

const checkTrueSolutions = (taskId, contestId, author, json) =>{
    for(let i in json){
        if (json[i].problem.index === taskId && json[i].verdict === 'OK'){
            let linkOnTasks = 'https://codeforces.com/contest/' + contestId + '/participant/' + author;
            links.insertAdjacentHTML('beforeend',
                `<p><a href="${linkOnTasks}">Link</a></p>`);
        }
    }
}

const GetLinks = () => {
    let form = document.forms[0].elements;
    getApiHacks(form[0].value, form[1].value, trimTask(form[2].value));
}

const trimTask = (requiredTest) => {
    let buff = '';
    for(let i in requiredTest){
        if(requiredTest[i] !== ' '){
            buff += requiredTest[i];
        }
    }
    return buff;
}
//"Solution verdict:\n
// WRONG_ANSWER\n
// \n
// Checker:\n
// wrong answer 1st numbers differ - expected: '3', found: '4'\r\n\n\n
// Input:\n
// 4\r\n
// 2 6 9 1\r\n\n\n
// Output:\n
// 4\r\n\n\n
// Answer:\n
// 3\r\n\n\n
// Time:\n
// 15\n\n
// Memory:\n
// 12288\n",