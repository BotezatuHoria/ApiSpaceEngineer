import requests

# Define the API endpoint and data to send
url = 'http://localhost:8080/signup'
data = {'email': 'jean', 'firstName': 'dadd',
        'lastName': 'sadasdasda', 'password': 'yes'}

# Send a POST request to the API endpoint with the data
response = requests.post(url, json=data)


if response.status_code == 200:
    print('Data successfully added.')
else:
    print('Error:', response.text)
