from flask import Flask, request
from flask_cors import CORS, cross_origin
import requests as r
app = Flask(__name__)
CORS(app, support_credentials=True)
@app.route('/get-sub')
@cross_origin(supports_credentials=True)

def get_sub():
    subId = request.args.get('subId')
    conId = request.args.get('conId')
    return r.get('''https://codeforces.com/contest/{}/submission/{}'''.format(conId, subId)).text

#https://codeforces.com/contest/672/hacks?verdictName=CHALLENGE_SUCCESSFUL&chosenProblemIndex=B

@app.route('/get-hack')
def get_hack():
    hackId = request.args.get('hackId')
    conId = request.args.get('conId')
    return r.get('''https://codeforces.com/contest/{}/hacks/{}'''.format(conId, hackId)).text

@app.route('/json-example')
def json_example():
    return 'JSON Object Example'

if __name__ == '__main__':
    app.run(debug=True, port=5000)