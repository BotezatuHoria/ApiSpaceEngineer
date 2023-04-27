import requests
url = 'http://localhost:8080/user'
newresponse = requests.get(url, json={'email': 'andrei', 'password': 'yes'})
if newresponse.status_code == 200:
    print('Data successfully received.')
else:
    print('Error:', newresponse.text)
