
service Os4esIec61850Service {
    	i32 start_server(1:bool dchg_cb, 2:bool cmd_cb),
	i32 stop_server(),
	string get_data(1:string logical_device, 2:string path_str),
	string set_data(1:string logical_device, 2:string path_str, 3:string val_str)
}
