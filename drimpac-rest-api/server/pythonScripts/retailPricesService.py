import argparse
import datetime
import sys
import csv
import json
import pandas as pd
import numpy as np
import paho.mqtt.client as paho
import os
import time
import paramiko
import subprocess
import os
import time
import shlex
import matplotlib.pyplot as plt

"""
The retailPricesService receives the usernames of the users, calculates the day_ahead
prices and publishes the messages to the subscriber.

"""
parser = argparse.ArgumentParser()

""" Sftp credentials. """
parser.add_argument(
   '--h', type = str, # sftp hostname
   required=True
   )

parser.add_argument(
   '--username', type = str, # sftp username
   required=True
   )

parser.add_argument(
    '--password', type = str, # sftp password
    required=True
    )

parser.add_argument(
   '--port', type = int,  # sftp port
   required=True
   )

args = parser.parse_args()
broker  = "localhost"  #host name
topic  = "info" #topic name


#    host = "160.40.52.193"
#    username = "drimpacftp"
#    password = "Drimpac2020!"
#    keyfile_path = None
#    port       = 22222

def connect_to_sftp():
    """ The function to connect to sftp using the credentials provided. """

    sftpclient = create_sftp_client(args.h, args.port ,args.username, args.password, None, 'RSA')


    # Retrieve a file from sftp server and copy it to local directory
    sftpclient.get('/sftp/drimpacftp/files/MIWenergia/tariff/Ptarif.csv', 'ptariff.csv')
    sftpclient.get('/sftp/drimpacftp/files/MIWenergia/housePrices/drimpacmiw.csv', 'prices.csv')
    sftpclient.get('/sftp/drimpacftp/files/MIWenergia/housePrices/2019 Index.csv', 'index.csv')
    sftpclient.close() # End of the SFTPClient.

    global ptariff
    global prices
    global index

    ptariff = pd.read_csv('ptariff.csv')
    prices  = pd.read_csv('prices.csv')
    index   = pd.read_csv('index.csv')

    # File processingin order for the values to be read as floats. (Values are provided as strings from MIWenergia)
    index['PMD'] = index['PMD'].str.replace(',','.')
    index['PC']  = index['PC'].str.replace(',','.')
    index['TOS']  = index['TOS'].str.replace(',','.')
    index['TOM']  = index['TOM'].str.replace(',','.')
    index['PerdEst']  = index['PerdEst'].str.replace(',','.')
    index['IM']  = index['IM'].str.replace(',','.')
    index['ATR']  = index['ATR'].str.replace(',','.')
    index['FNEE']  = index['FNEE'].str.replace(',','.')
    index['PrecioFinal']  = index['PrecioFinal'].str.replace(',','.')


def create_sftp_client(host, port, username, password, keyfilepath, keyfiletype):
    """
    create_sftp_client(host, port, username, password, keyfilepath, keyfiletype) -> SFTPClient

    Creates a SFTP client connected to the supplied host on the supplied port authenticating as the user with
    supplied username and supplied password or with the private key in a file with the supplied path.
    If a private key is used for authentication, the type of the keyfile needs to be specified as DSA or RSA.
    :rtype: SFTPClient object.

    """

    sftp      = None
    key       = None
    transport = None

    try:
        if keyfilepath is not None:
            # Get private key used to authenticate user.
            if keyfiletype == 'DSA':
                # The private key is a DSA type key.
                key = paramiko.DSSKey.from_private_key_file(keyfilepath)
            else:
                # The private key is a RSA type key.
                key = paramiko.RSAKey.from_private_key_file(keyfilepath)

        # Create Transport object using supplied method of authentication.
        transport = paramiko.Transport((host, port))
        transport.connect(None, username, password, key)

        sftp = paramiko.SFTPClient.from_transport(transport)

        return sftp

    except Exception as e:
        print('An error occurred creating SFTP client: %s: %s' % (e.__class__, e))
        if sftp is not None:
            sftp.close()
        if transport is not None:
            transport.close()
        pass


def on_connect(client, userdata, flags, rc):
    ''' The callback for when the client connects to the broker. '''
    print("Connected with result code {0}".format(str(rc)))  # Print result of connection attempt
    print("")

def on_publish(client,userdata,result):
    ''' The callback for when the client publishes a message. '''
    print("Published data is : ")
    print("")
    pass

def on_message(client, userdata, message):

        print("Received data is : \n")
        # Convert message to utf_8 encoding
        msg = str(message.payload.decode("utf-8"))
        print(msg)
        print("")

        # Convert message to json
        msg_json = json.loads(msg)

        # Store user ids from the message received
        userId = []
        for i in range(0, len(msg_json)):
            userId.append(msg_json[i]['User_Id'])


        # Connect to sftp client
        connect_to_sftp()

        # Necessary replacement for the files to be compatible
        prices['TarifaNombre'] = prices['TarifaNombre'].str.replace('6.1','6.1 A')
        # Νext day datetime
        day_ahead_dt   = datetime.datetime.today() + datetime.timedelta(days=1)
        date_time      = day_ahead_dt.strftime("%Y-%m-%d 0:00:00")
        day_ahead_date = day_ahead_dt.strftime("%Y-%m-%d")

        # Variable dynamic_date_dt refers to previous year because the available dynamic data
        # are for 2019. This is done to demonstrate the system interoperability.
        dynamic_date_dt = datetime.datetime.today() - datetime.timedelta(days=364)
        dynamic_date    = dynamic_date_dt.strftime("%d/%m/%Y 0:00:00")

        da_final = []
        for user in userId:
            if user in prices.values:

                # Find user's profile
                user_profile = prices.loc[prices['DrimpacId'] == user, 'TarifaNombre']
                taxes = 5.113 / 100 # stated by MyEnergia
                vat   = 21 / 100 # stated by MyEnergia

                c = 0 # simple counter
                period_Id = np.zeros((24), dtype = np.int32) # initialize numpy array

               # Get period ids for day of interest (day-ahead)
                for i in range (0, ptariff.shape[0]):

                     if ptariff.iloc[i]["TimeStamp"] == date_time and ptariff.iloc[i]["Tarif"] == user_profile[user_profile.index[0]]:
                        for j in range (i, i + 24):
                            period_Id[c] = ptariff.iloc[j]["PetarId"]
                            c = c + 1
                        break

                # Correspond name of period from tariff file to user template (prices)
                period = []
                day_ahead_prices = []
                if user_profile[user_profile.index[0]] == "2.0 DHA":

                    for i in range(0,24):
                        if period_Id[i] == 1:
                            period.append("Punta")
                        else:
                            period.append("Valle")

                elif user_profile[user_profile.index[0]] == "6.1 A":

                    for i in range(0,24):
                        if  period_Id[i]  == 1:
                           period.append("P1")
                        elif period_Id[i] == 2:
                           period.append("P2")
                        elif period_Id[i] == 3:
                           period.append("P3")
                        elif period_Id[i] == 4:
                           period.append("P4")
                        elif period_Id[i] == 5:
                             period.append("P5")
                        else:
                            period.append("P6")

                elif user_profile[user_profile.index[0]] == "2.0 A":
                    for i in range(0,24):
                        period.append("Llano")

                elif user_profile[user_profile.index[0]] == "3.0 A":
                    for i in range(0, index.shape[0]):
                        if index.iloc[i]['FechaHoraInicial'] == dynamic_date and index.iloc[i]['TarifaNombre'] == "3.0 A":
                                print("inside")
                                for j in range (i, i + 24):
                                    #print(index.iloc[j]['PrecioFinal'])
                                    fp = float(index.iloc[j]['PrecioFinal'])
                                    fp = fp / 1000
                                    day_ahead_prices.append(round(fp, 4))
                                break


                if user_profile[user_profile.index[0]] != "3.0 A":

                    for i in range(0,24):
                        a = prices.index[prices['AliasPeriodo'] == period[i]].values
                        b = prices.index[prices['DrimpacId'] == user].values
                        c = np.intersect1d(a,b)

                        # Calculate retail prices according to the provided fromulas
                        day_ahead_prices.append(round(float(prices.iloc[c]['PreciokWh']) * (1 + taxes + vat), 4))

                hour_index = ["00:00","01:00","02:00","03:00","04:00","05:00","06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00",
                              "14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00","23:00"]

                final = {} # one user's price data
                for i in range(0, 24):
                    # Correspond each time of the day with the retail day_ahead price
                    final[hour_index[i]] = str(day_ahead_prices[i])

                da_final.append(final) # all users' price data

            else:
                print("Not a valid id")
                print("Waiting for new message...")

        broker = "localhost" #host name , Replace with your IP address.
        port   = 1883 #MQTT data listening port
        topic_to_publish = "new"
        #ACCESS_TOKEN='M7OFDCmemyKoi461BJ4j' #not manditory
        client1 = paho.Client("control1") #create client object
        client1.on_publish = on_publish #assign function to callback
        #client1.username_pw_set(ACCESS_TOKEN) #access token from thingsboard device
        client1.connect(broker) #establishing connection

        final_data = [{"User_Id": t, "Date": day_ahead_date,"Day_Ahead_Prices": s} for t, s in zip(userId, da_final)]
        payload = json.dumps(final_data, indent = 4)
        ret = client1.publish(topic_to_publish,payload) #topic name is test
        print(payload)
        print(day_ahead_prices)
        print("Please check data on your Subscriber Code \n")
        print("")


client = paho.Client("user") #create client object
client.on_connect = on_connect
client.on_message = on_message

print("")
print("Connecting to broker host",broker)
print("")
client.connect(broker, 1883)#connection establishment with broker
print("Subscribing begins here")
client.subscribe(topic)
print("")
#subscribe topic test
client.loop_forever()#contineously checking for message
