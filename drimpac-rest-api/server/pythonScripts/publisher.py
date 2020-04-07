import paho.mqtt.client as paho
import argparse
import time
import sys
import datetime
import time
import json


parser = argparse.ArgumentParser()

# sftp credentials
parser.add_argument(
   '--h', type = str, # host name to send message
   required=True
   )
 #160.40.49.197

'''
parser.add_argument(
   '--t', type = str,  # topic to publish
   required=True
   )
 '''
'''
parser.add_argument(
    '--id', type = str, # houseId
    required=True
    )


parser.add_argument(
    '--topic', type = str, # topic for message
    required=True
    )
'''

parser.add_argument(
'--list', type = str,
nargs='+',
help='<Required> Set flag',
required=True)

args = parser.parse_args()
broker = args.h #host name , Replace with your IP address.
topic  = "info"
#port=1883 #MQTT data listening port
#ACCESS_TOKEN='M7OFDCmemyKoi461BJ4j' #not manditory

def on_publish(client,userdata,result): #create function for callback
  print("published data is : ")
  pass

client1 = paho.Client("control2") #create client object
client1.on_publish = on_publish #assign function to callback
#client1.username_pw_set(ACCESS_TOKEN) #access token from thingsboard device
#client1.connect(broker,port,keepalive=60) #establishing connection
client1.connect(broker)


#print(temp[0])

id = []
id = args.list
topic1 = []

for i in range(0, len(id)):
    topic1.append("drimpac/epe/" + id[i])

#print(topic1)

user_info = [{"User_Id": t,  "Topic": s} for t, s in zip(id, topic1)]

#payload = '{ "User_Ids":"","Topic":""}'


MQTT_MSG = json.dumps(user_info, indent = 4)
#payload = '{ "Data" : [' + json_data + ' ] }'
ret = client1.publish(topic, MQTT_MSG) #topic name is test
print(MQTT_MSG)
print("Please check data on your Subscriber Code \n")
