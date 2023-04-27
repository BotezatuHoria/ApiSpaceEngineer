import requests

url = 'http://localhost:8080/login'
data = {'email': 'jean', 'password': 'yes'}

response = requests.post(url, json=data)

if response.status_code == 200:
    print('Logged in succesfully.')
else:
    print('Error:', response.text)
