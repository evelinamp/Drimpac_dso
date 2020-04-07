import thriftpy
import time
import requests
os4es_thrift = thriftpy.load("./server/pythonScripts/server.thrift", module_name="os4es_thrift")

from thriftpy.rpc import make_client

client = make_client(os4es_thrift.Os4esIec61850Service, '127.0.0.1', 6000)
#get_data
value = client.get_data("SmartHousePVFronius", "W.W")
print(value)
