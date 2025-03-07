
var Globals = {
    'min':2,
    'max':50,
    'max1':512,
    'shortcode':3,
    'maxSize':5242880, // 5mb in bytes
    'documentdir':'C://xampp/htdocs/invoice/uploads/', 
    'documenturl':'http://192.168.0.254:90/invoice/uploads/',
    
    'validation_msg':{
        'unique':'is already in used',
        'empty':'can not be blank',
        'emptyNumber':'can not be blank',
        'notvalid':'is not valid',
        'min':'is too small',
        'max':'should not exceed 50 characters.',
        'max1':'should not exceed 512 characters.',
        'minmax':'should be greater than 2 and lesser than 50 characters',
        'notNumber':'is not a number',
        'required':'is required',
        "wrongmsg" : "Something went wrong. Please try again",
        "RECORD_NOT_EXIST":"Record not exist",
        "RECORD_EXIST":"The entered mobile number has already been registered"
    }
}

module.exports = Globals;