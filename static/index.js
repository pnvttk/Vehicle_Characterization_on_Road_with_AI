type_arr = ["Pickup",
    "Motorcycle",
    "Truck",
    "Sedan",
    "SUV",
    "Bus",
    "Van"]

brand_arr = ["Toyota",
    "Honda",
    "Isuzu",
    "Mitsubishi",
    "Ford",
    "Nissan",
    "Mazda",
    "Suzuki",
    "MG",
    "Chevrolet",
    "Volvo",
    "Mercedes-Benz",
    "BMW",
    "Foton",
    "Tata",
    "Lexus",
    "Hyundai",
    "Hino",
    "Volkswagen",
    "Subaru",
    "Peugeot",]

color_arr = ["Black",
    "White",
    "Silver",
    "Grey",
    "Red",
    "Blue",
    "Yellow",
    "Orange",
    "Green",
    "Gold",
    "Brown",]

// ? num for compare data between detect and uptodb
var num

window.onload = () => {

    //Check File API support
    if (window.File && window.FileList && window.FileReader) {

        // ? get file input 
        var filesInput = document.getElementById("imageinput");

        if (filesInput) {

            filesInput.addEventListener("change", function (event) {

                // ? FileList object
                var files = event.target.files;

                // ? div for preview
                var output = document.getElementById("result");

                // ? loop get image file
                for (let i = 0; i < files.length; i++) {
                    var file = files[i];

                    //Only pics
                    if (!file.type.match('image'))
                        continue;

                    var picReader = new FileReader();

                    picReader.addEventListener("load", function (event) {

                        // ? id for each image
                        abox = String("abox" + i)
                        imagebox = String("imagebox" + i)

                        // * check
                        // console.log(abox)
                        // console.log(imagebox)

                        var picFile = event.target;

                        // ? create new div
                        img_div = document.createElement("div");

                        // ? appaned to preview div
                        output.append(img_div)

                        // ? create popup
                        img_a = document.createElement("a")

                        // ? set attr
                        img_a.setAttribute('href', picFile.result)
                        img_a.setAttribute('data-featherlight', "image")
                        // img_a.setAttribute('name', file.name)
                        img_a.setAttribute('id', abox)

                        // ? append to img div
                        img_div.append(img_a)

                        // ? create img tag
                        img_arr = document.createElement("img")

                        // ? set attr
                        img_arr.className = "thumbnail mt-3"
                        img_arr.style = 'width: 80% ; height:auto;'
                        img_arr.name = file.name
                        img_arr.id = imagebox
                        img_arr.setAttribute("src", picFile.result)

                        // ? append to a
                        img_a.append(img_arr)

                        // output.insertBefore(img_div, null);

                    });
                    //Read the image
                    picReader.readAsDataURL(file);
                }

            });
        }
    }
    else {
        console.log("Your browser does not support File API");
    }


    $('#sendbutton').click(() => {

        // ? input 
        input_box = $('#inputBox')

        // ? set text field value to empty
        input_box.empty()

        // ? Get image input
        input = $('#imageinput')[0]

        // ? for clear all data before upload new img
        input_z = $('#imageinput')

        // ? img preview div
        output = $('#result');

        // ? image preview
        input_z.click(() => {
            // ? set text field value to empty
            output.empty()
            input_box.empty()
            document.getElementById('sendtoDB').style.display = "none";
        })

        // ? if get input
        if (input.files && input.files[0]) {

            // ? payload to backend
            let formData = new FormData();

            // ? get list of input file
            inpFile = document.getElementById('imageinput')

            // ? push all input file
            for (const file of inpFile.files) {
                formData.append("image", file)
            }

            // * check formdata
            // for (const [key, value] of formData) {
            //     // console.log(`key : ${key}`)
            //     // console.log(`value : ${value}`)
            // }


            // ? ajax send to backend
            $.ajax({

                url: "/detectObject",
                type: "POST",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,

                // ? error handle
                error: function (data) {

                    console.log("upload error", data);
                    console.log(data.getAllResponseHeaders());

                    // ? alert err msg
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: "Failed to upload, Please try agian.",
                    }).then(function () {
                        location.reload();
                    }
                    );
                },

                // ? handle return from backend
                success: function (data) {

                    // * check 
                    // console.log("upload success");
                    // console.log(data);

                    // ? empty
                    box_path = []
                    c_result_arr = []

                    data = data

                    // ? loop all data from payload
                    for (i in data) {

                        // * check
                        // console.log(i)
                        // console.log(data[i])

                        // ? get data from flask
                        a_msg = data[i]['alert']
                        bytestring = data[i]['status']
                        ocr_txt = data[i]['json_ocr_txt']
                        motorcycle_obj = data[i]['motorcycle']
                        count_result = data[i]['count_result']
                        box_path_hidden = data[i]['box_path']
                        box_path.push(data[i]['box_path'])

                        // ? create h element 
                        h_elm = document.createElement("h3")

                        // ? set header number for image
                        num = parseInt(i) + 1
                        h_elm.innerHTML = "Image " + num + " :"

                        // ? append h element to id input_box
                        input_box.append(h_elm)

                        // ? create div elemnt for input field
                        div_car_img = document.createElement("div")

                        // ? class bootstap floating text
                        div_car_img.setAttribute("id", "image" + num);

                        input_box.append(div_car_img)


                        // ? div for cars 
                        div_car = document.createElement('div')

                        // ? set attr
                        div_car.setAttribute("id", "car" + num)

                        // ? appaend to div car img
                        div_car_img.append(div_car)


                        // ? if get counts result 
                        if (count_result != undefined) {

                            // ? rearrange text
                            c_result = count_result.toString().split("\g").join("\n")
                            c_result = c_result.replace("name", "Results")
                            c_result = c_result.replace("dtype: int64", "")

                            // ? create p for result each image
                            p_result = document.createElement("p")

                            // ? set attr
                            p_result.style = "white-space: pre-wrap;"

                            // ? set text inside p_result elm
                            p_result.innerHTML = c_result

                            // ? append p element to id input_box
                            div_car_img.append(p_result)

                            // ? remove number for input name
                            c_result = c_result.replace("Results", "")
                            c_result_remove = c_result.replace(/[0-9]/g, '');
                            c_result_remove = c_result_remove.replace('\t', '');
                            c_result_remove = c_result_remove.replace(/\s/, '');
                            c_result_remove = c_result_remove.replace(/^\s+|\s+$/gm, '');

                            // * check
                            // console.log(c_result_remove)

                            // ? create new line 
                            // c_result_arr = c_result_remove.split("\n")
                            c_result_arr.push(c_result_remove.split("\n"))

                            // * check
                            // console.log(c_result_arr)
                        }

                        // * check
                        // console.log("a_msg : ", a_msg)
                        // console.log("bytestring : ", bytestring)
                        // console.log("ocr_txt : ", ocr_txt)
                        // console.log(typeof ocr_txt)
                        // console.log("count_result : ", count_result)

                        // ? if get image
                        if (bytestring != undefined) {

                            // * check
                            // console.log("box_path :", box_path)

                            // ? image preview
                            imagebox = $('#imagebox' + [i])

                            // ? featherlight img popup
                            abox = $('#abox' + [i])

                            // ? replace image with new image from backend
                            abox.attr('href', 'data:image/jpeg;base64,' + bytestring)
                            imagebox.attr('src', 'data:image/jpeg;base64,' + bytestring)

                            // ? alert msg
                            Swal.fire({
                                icon: 'success',
                                title: 'Successfully',
                                text: 'Obejct Detection have been compleate!',
                            })
                        }

                        // ? if get ocr text
                        if (ocr_txt && Object.keys(ocr_txt).length != 0) {

                            // console.log("ocr_txt not empty")
                            // console.log(ocr_txt)
                            // console.log(typeof ocr_txt)

                            // ? show upload to db button
                            document.getElementById('sendtoDB').style.display = "block";

                            // ? empty array 
                            plate_arr = ""
                            province_arr = ""

                            // ! new func
                            count = 1
                            for (j in ocr_txt) {

                                // *check
                                // console.log(j + ocr_txt[j])

                                // ? create p element 
                                p_elm = document.createElement("p")

                                // ? set text inside
                                p_elm.innerHTML = "Car " + count + " :"

                                // ? append p element to id input_box
                                div_car_img.append(p_elm)

                                // ? Loop get all data from ocr_text
                                for (key in ocr_txt[j]) {

                                    // * check
                                    // console.log(key + " : " + j + " : value : " + ocr_txt[j][key])

                                    if (key == "plate") {
                                        input_val = ocr_txt[j][key]
                                    }

                                    if (key == "province") {

                                        // ? check if province text == null
                                        if (ocr_txt[j][key] == null) {

                                            input_val = "-"

                                            Swal.fire({
                                                icon: 'warning',
                                                title: "Detect successfully.",
                                                text: "But can't detect some text, Double check before process.",
                                            })
                                        } else {
                                            input_val = ocr_txt[j][key]
                                        }
                                    }

                                    // ? create div elemnt for input field
                                    div_elm = document.createElement("div")

                                    // ? class bootstap floating text
                                    div_elm.setAttribute("class", "form-floating");

                                    // ? appaend to input_box
                                    div_car.append(div_elm)

                                    // ? create input element
                                    input_elm = document.createElement('input')

                                    // ? set attr
                                    input_elm.type = "text";
                                    input_elm.name = key + j;
                                    input_elm.id = key;
                                    // input_elm.id = "floatingInput"
                                    input_elm.value = input_val
                                    input_elm.className = "form-control mt-3 mb-3"
                                    input_elm.required = true;

                                    // ? append to div element
                                    div_elm.append(input_elm)

                                    // ? create label element
                                    label_elm = document.createElement('label')

                                    // ? set attr
                                    label_elm.setAttribute("for", "floatingInput");
                                    label_elm.innerHTML = key
                                    label_elm.className = "text-dark"

                                    // ? append to div element
                                    div_elm.append(label_elm)
                                }
                                // ? increment count for car number
                                count += 1

                                // ? hidden input image path 
                                input_hiden = document.createElement('input')

                                // ? set attr
                                input_hiden.type = "hidden";
                                input_hiden.id = "image" + i;
                                input_hiden.value = data[i]['box_path']

                                // ? append to div element
                                div_car.append(input_hiden)

                                // * check
                                // console.log("box path : " + data[i]['box_path'])
                                // console.log("box path : " + data[i]['box_path'])


                                //? hidden input c_result path 
                                c_result_hidden_input = document.createElement('input')

                                // ? set attr
                                c_result_hidden_input.type = "hidden";
                                c_result_hidden_input.id = "result" + i;
                                c_result_hidden_input.value = c_result_arr[i]

                                // ? append to div element
                                div_car.append(c_result_hidden_input)

                                // * check
                                // console.log("c_result_hiden : " + c_result_arr + " " + i)
                                // console.log("box path : " + data[i]['box_path'])

                            }
                        }
                        if (motorcycle_obj && Object.keys(motorcycle_obj).length != 0) {
                            // ? if not get ocr_txt

                            // * check
                            // console.log("[ Get motorcycle ]")

                            // ? show upload to db button
                            document.getElementById('sendtoDB').style.display = "block";


                            // console.log("motorcycle_obj")
                            // console.log(data)

                            // for (k in motorcycle_obj) {

                            // console.log("mmmmmmmmmmmmmmmmmmmmmmmmmmm")
                            // console.log(i)
                            // console.log(parseInt(k))
                            // console.log(motorcycle_obj[k])

                            // ? div for motorcycle
                            div_mtc = document.createElement('div')

                            // ? set attr
                            div_mtc.setAttribute("id", "mtc" + i)

                            // ? append to input box
                            input_box.append(div_mtc)


                            // ? hidden input image path 
                            input_m_hiden = document.createElement('input')

                            // ? set attr
                            input_m_hiden.type = "hidden";
                            input_m_hiden.id = "image" + i;
                            input_m_hiden.value = data[i]['box_path']

                            // ? append to div element
                            div_mtc.append(input_m_hiden)

                            // * check
                            // console.log("box path : " + data[i]['box_path'])
                            // console.log("box path : " + data[i]['box_path'])

                            //? hidden input c_result path 
                            m_result_hidden_input = document.createElement('input')

                            // ? set attr
                            m_result_hidden_input.type = "hidden";
                            m_result_hidden_input.id = "result" + i;
                            m_result_hidden_input.value = c_result_arr[i]

                            // ? append to div element
                            div_mtc.append(m_result_hidden_input)

                            // * check
                            // console.log("c_result_hiden : " + c_result_arr + " " + i)
                            // console.log("box path : " + data[i]['box_path'])
                            // }
                        }


                        // ? if alert msg is not set
                        if (a_msg != undefined) {

                            // ? alert err msg
                            Swal.fire({
                                icon: 'error',
                                title: 'Oops...',
                                text: "Object Detection have been failed! \n Look like there isn't car in this image",
                            }).then(function () {
                                location.reload();
                            }
                            );
                        }
                    }
                }
            });
        }
    });

    $('#sendtoDB').click(() => {

        // ? empty arr and null temp
        input_arr = []
        temp_plate = null
        temp_province = null
        temp_img = null
        temp_result = null
        for (let i = 0; i < num; i++) {

            console.log("num  = " + num)
            console.log("i  = " + i)


            // * console.log("check")
            console.log("----------------------CAR----------------------")
            // console.log(div_car_img)

            // ? get all input spilt by image div
            div_car_img = "image" + (i + 1)
            get_div_car_img = document.getElementById(div_car_img)

            // console.log("input_form === GETING")


            if (get_div_car_img !== null) {

                // ? get div car
                div_car = "car" + (i + 1)
                get_div_car = document.getElementById(div_car)

                if (get_div_car !== null) {
                    console.log("get element input ------------------------------------****")

                    get_input_form = get_div_car.getElementsByTagName('input')


                    if (get_input_form && Object.keys(get_input_form).length != 0) {

                        input_form = get_input_form

                        // * check
                        // console.log("input_form.length")
                        // console.log(input_form.length)
                        // console.log(input_form)
                    }
                } else {
                    console.log("input_form === null")
                    input_form = null
                    console.log("input_form === null")
                }
            }

            if (input_form && Object.keys(input_form).length !== 0) {


                console.log("[INPUT FORM] get input from car")
                // console.log(input_form.length)
                console.log(input_form)
                console.log("[INPUT FORM] get input from car")

                // ? loop get only id, value
                for (j in input_form) {

                    // ? empty input arr
                    var input_obj = {}
                    input_obj['plate'] = j
                    input_obj['province'] = j + 1
                    input_obj['img'] = j + 2
                    input_obj['brand'] = j + 3
                    input_obj['type'] = j + 4
                    input_obj['color'] = j + 5

                    // console.log("jjjjjjjjjjjjjjjjjjjjjjjjjjjj")
                    // console.log()

                    if (input_form[j]) {
                        if (input_form[j]["id"] && input_form[j]["value"]) {

                            // * check
                            console.log("loop : " + j)
                            console.log("id : " + input_form[j]['id'] + " | value :" + input_form[j]['value'])

                            // throw new Error("stop");

                            // ? case for spilt 3 key and value
                            switch (j % 4) {
                                case 0:

                                    // * check
                                    // console.log("get plate : " + input_form[j]['value'])

                                    // ? get value
                                    temp_plate = input_form[j]['value']

                                    // ? add if not null 
                                    if (temp_plate) {

                                        // * check
                                        console.log("push [" + temp_plate + "] to temp_plate")

                                        input_obj['plate'] = temp_plate
                                    } else {

                                        // * check
                                        console.log("TEMP PLATE IS NULL")

                                        temp_plate = "NULL"
                                        input_obj['plate'] = temp_plate
                                    }
                                    break
                                case 1:

                                    // * check
                                    // console.log("get province : " + input_form[j]['value'])

                                    // ? get value
                                    temp_province = input_form[j]['value']

                                    // ? add if not null
                                    if (temp_province) {

                                        // * check
                                        console.log("push [" + temp_province + "] to temp_province")

                                        input_obj['province'] = temp_province
                                        // input_obj['plate'] = temp_plate
                                    } else {

                                        // * check
                                        console.log("TEMP PROVINCE IS NULL")

                                        temp_province = "NULL"
                                        input_obj['province'] = temp_province

                                    }
                                    break
                                case 2:

                                    // * check
                                    // console.log("get image path : " + input_form[j]['value'])

                                    // ? get value
                                    temp_img = input_form[j]['value']

                                    // ? add if not null
                                    if (temp_img) {
                                        // input_obj['province'] = temp_province
                                        // input_obj['plate'] = temp_plate

                                        // * check
                                        console.log("push [" + temp_img + "] to temp_img")
                                        input_obj['img'] = temp_img
                                    } else {
                                        console.log("TEMP IMG IS NULL")
                                        temp_img = "Null"
                                        input_obj['img'] = temp_img
                                    }
                                    break
                                case 3:
                                    // * check
                                    // console.log("get result path : " + input_form[j]['value'])

                                    // ? get value
                                    temp_result = input_form[j]['value']
                                    console.log("GET [" + temp_result + "] ")
                                    console.log(temp_result)
                                    console.log("using stringToArr func")
                                    obj_result = stringToArr(temp_result)

                                    // * check
                                    console.log("[Object RESULT]")
                                    console.log(obj_result)


                                    for (let arr in obj_result) {

                                        // * check
                                        // console.log("loop objresult" + arr)
                                        // console.log(obj_result[arr])

                                        switch (arr % 3) {

                                            case 0:
                                                if (obj_result[arr] != 0) {

                                                    temp_brand = obj_result[arr]

                                                    // * check
                                                    console.log("temp_brand")
                                                    console.log(temp_brand)
                                                } else {

                                                    temp_brand = null

                                                    // * check
                                                    console.log("brand = NULL")
                                                }
                                                break

                                            case 1:
                                                if (obj_result[arr] != 0) {
                                                    temp_type = obj_result[arr]
                                                    console.log(temp_type)
                                                } else {
                                                    temp_type = null
                                                    console.log("type = NULL")
                                                }
                                                break

                                            case 2:
                                                if (obj_result[arr] != 0) {

                                                    temp_color = obj_result[arr]

                                                    // * check
                                                    console.log(temp_color)
                                                } else {
                                                    temp_color = null

                                                    // * check
                                                    console.log("color = NULL")
                                                } break
                                        }
                                    }

                                    // ? add if not null
                                    // if (temp_province != null || temp_province != undefined) {

                                    input_obj['brand'] = temp_brand
                                    input_obj['type'] = temp_type
                                    input_obj['province'] = temp_province
                                    input_obj['plate'] = temp_plate
                                    input_obj['img'] = temp_img

                                    // * check
                                    // console.log(JSON.stringify(temp_brand))
                                    // console.log(JSON.stringify(temp_type))
                                    // console.log(JSON.stringify(temp_color))

                                    if (temp_brand != null) {
                                        var temp_brand = temp_brand.map(function (brand) {
                                            return brand['brand'];
                                        });

                                        // ? arr to string
                                        temp_brand = temp_brand.toString()

                                        // ? replace , with newline
                                        temp_brand = temp_brand.replace(/,/g, '\n');

                                        // * check
                                        // console.log(temp_brand)
                                    }

                                    if (temp_type != null) {
                                        var temp_type = temp_type.map(function (type) {
                                            return type['type'];
                                        });

                                        // ? arr to string
                                        temp_type = temp_type.toString()

                                        // ? replace , with newline
                                        temp_type = temp_type.replace(/,/g, '\n');

                                        // * check
                                        // console.log(temp_type)
                                    }

                                    if (temp_color != null) {
                                        var temp_color = temp_color.map(function (color) {
                                            return color['color'];
                                        });

                                        // ? arr to string
                                        temp_color = temp_color.toString()

                                        // ? replace , with newline
                                        temp_color = temp_color.replace(/,/g, '\n');

                                        // * check
                                        // console.log(temp_color)
                                    }

                                    input_obj['brand'] = temp_brand
                                    input_obj['type'] = temp_type
                                    input_obj['color'] = temp_color
                                    // }
                                    break

                            }

                            // ? push to arr and reset temp variable
                            if (temp_plate && temp_province && temp_img && temp_result) {

                                // ? check
                                console.log("************ push obj car ************")

                                // ? push obj to arr
                                input_arr.push(input_obj)

                                // ? reset temp variable
                                temp_plate = null
                                temp_province = null
                                temp_img = null
                                temp_result = null
                            }
                        }
                    }
                }
            } else {
                console.log("[ input form empty ]")
            }

            // ? get all input spilt by image div
            console.log("----------------------MOTORCYCLE----------------------")
            // console.log(div_mtc)

            div_mtc = "mtc" + (i)
            get_div_mtc = document.getElementById(div_mtc)

            // console.log("div_mtc + " + i)
            // console.log(div_mtc)

            if (get_div_mtc !== null) {
                mtc_input_form = get_div_mtc.getElementsByTagName('input')
                console.log(mtc_input_form)
            } else {
                console.log("mtc_input_form === null")
                mtc_input_form = null
            }

            // * check
            // console.log("input_form : " + i)
            // console.log(input_form)
            // console.log(typeof input_form)

            if (mtc_input_form && Object.keys(mtc_input_form).length != 0) {
                console.log("[ Get mtc input form ]")

                for (j in mtc_input_form) {


                    // ? empty input arr
                    var input_obj = {}
                    // input_obj['img'] = j
                    // input_obj['province'] = j + 1
                    // input_obj['plate'] = j + 2
                    // input_obj['brand'] = j + 3
                    // input_obj['type'] = j + 1
                    // input_obj['color'] = j + 2


                    if (mtc_input_form[j]["id"] && mtc_input_form[j]["value"] != undefined) {

                        // * check
                        console.log("[ MTC loop : " + j + " ]")
                        // console.log(mtc_input_form[j]['value'])

                        switch (j % 2) {

                            case 0:

                                // * check
                                console.log("get image path : " + mtc_input_form[j]['value'])

                                // ? get value
                                temp_img = mtc_input_form[j]['value']
                                console.log("MTC case 0 get [image]")

                                // // ? add if not null
                                // if (temp_img) {
                                //     // input_obj['province'] = temp_province
                                //     // input_obj['plate'] = temp_plate
                                //     input_obj['img'] = temp_img
                                // }
                                break

                            case 1:
                                // * check
                                console.log("get result : " + mtc_input_form[j]['value'])

                                // ? get value
                                temp_result = mtc_input_form[j]['value']
                                // console.log("MTC case 1 get [result]")

                                // * check
                                console.log("[ MTC result to string ]")
                                obj_result = stringToArr(temp_result)
                                console.log(obj_result)


                                for (let arr in obj_result) {

                                    // * check
                                    // console.log(" MTC loop obj result" + arr)
                                    // console.log(obj_result[arr])

                                    switch (arr % 3) {

                                        case 0:
                                            if (obj_result[arr] != 0) {

                                                temp_brand = obj_result[arr]

                                                // * check
                                                console.log("MTC brand GET")
                                                console.log(temp_brand)
                                            } else {

                                                temp_brand = null

                                                // * check
                                                console.log("MTC brand = NULL")
                                            }
                                            break

                                        case 1:
                                            if (obj_result[arr] != 0) {
                                                temp_type = obj_result[arr]
                                                console.log("MTC type GET")
                                                console.log(temp_type)
                                            } else {
                                                temp_type = null
                                                console.log("MTC type = NULL")
                                            }
                                            break

                                        case 2:
                                            if (obj_result[arr] != 0) {

                                                temp_color = obj_result[arr]

                                                // * check
                                                console.log("MTC type GET")
                                                console.log(temp_color)
                                            } else {
                                                temp_color = null

                                                // * check
                                                console.log("MTC color = NULL")
                                            } break
                                    }
                                }

                                // ? add if not null
                                // if (temp_province != null || temp_province != undefined) {

                                input_obj['brand'] = temp_brand
                                input_obj['type'] = temp_type
                                input_obj['province'] = "NULL"
                                input_obj['plate'] = "NULL"
                                input_obj['img'] = temp_img

                                // * check
                                // console.log(JSON.stringify(temp_brand))
                                // console.log(JSON.stringify(temp_type))
                                // console.log(JSON.stringify(temp_color))
                                if (temp_brand != null) {
                                    var temp_brand = temp_brand.map(function (brand) {
                                        return brand['brand'];
                                    });

                                    // ? arr to string
                                    temp_brand = temp_brand.toString()

                                    // ? replace , with newline
                                    temp_brand = temp_brand.replace(/,/g, '\n');

                                    // * check
                                    // console.log(temp_brand)
                                } else {
                                    // console.log("set temp brand to NULL")
                                    temp_brand = "NULL"
                                }

                                if (temp_type != null) {
                                    var temp_type = temp_type.map(function (type) {
                                        return type['type'];
                                    });

                                    // ? arr to string
                                    temp_type = temp_type.toString()

                                    // ? replace , with newline
                                    temp_type = temp_type.replace(/,/g, '\n');

                                    // * check
                                    // console.log(temp_type)
                                } else {
                                    temp_type = "NULL"
                                }

                                if (temp_color != null) {
                                    var temp_color = temp_color.map(function (color) {
                                        return color['color'];
                                    });

                                    // ? arr to string
                                    temp_color = temp_color.toString()

                                    // ? replace , with newline
                                    temp_color = temp_color.replace(/,/g, '\n');

                                    // * check
                                    // console.log(temp_color)
                                } else {
                                    temp_color = "NULL"
                                }

                                input_obj['brand'] = temp_brand
                                input_obj['type'] = temp_type
                                input_obj['color'] = temp_color
                                // }
                                break

                        }
                        // ? push to arr and reset temp variable
                        if (temp_type && temp_color) {

                            // ? check
                            console.log("************ push obj motorcycle ************")

                            // ? push obj to arr
                            input_arr.push(input_obj)

                            // ? reset temp variable
                            temp_plate = null
                            temp_province = null
                            // temp_img = null
                            temp_result = null
                        }
                    }

                    console.log("----------------------END MOTORCYCLE----------------------")

                }
            } else {
                console.log("[ motorcycle input is empty ]")
            }
        }




        // * check
        console.log("----------INPUT ARR--------------")
        console.log(input_arr)
        console.log("---------------------------------")


        // * check
        console.log("----------Remove Empty ARR--------------")
        input_arr = input_arr.filter(e => {
            if (Object.keys(e).length !== 0) {
                return true
            }
            return false
        })
        console.log(input_arr)
        console.log("---------------------------------")


        console.log("----------Remove duplicate ARR--------------")
        // input_arr = input_arr.filter((value, index, self) =>
        //     index === self.findIndex((t) => (
        //         t.place === value.place && t.name === value.name
        //     ))
        // )

        let remove_dup = input_arr.filter(
            (obj, index) => index === input_arr.findIndex(
                other => obj.plate === other.plate
                    && obj.province === other.province
                    && obj.brand === other.brand
                    && obj.color === other.color
                    && obj.type === other.type
                    && obj.img === other.img
            ));
        console.log(remove_dup);

        input_arr = remove_dup

        // console.log(input_arr)
        console.log("---------------------------------")



        // ? store arr in data 
        data = input_arr

        // * check
        // console.log("JSON.stringify(data)")
        // console.log(JSON.stringify(data))

        $.ajax({
            url: "/sendtoDB",
            type: "POST",
            contentType: 'application/json',
            data: JSON.stringify(data),
            dataType: 'json',
            // cache: false,
            // processData: false,
            // contentType: false,

            // ? error handle
            error: function (response) {

                console.log("upload error", response);
                // console.log(response.getAllResponseHeaders());
                // console.log(response.responseText)

                // ? alert err msg
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: "Failed to push to database.",
                }).then(function () {
                    location.reload();
                }
                );
            },
            success: function (response) {

                // * check
                console.log("upload success");
                // console.log(response);

                // ? alert msg
                Swal.fire({
                    icon: 'success',
                    title: 'Successfully',
                    text: 'Upload to database success!',
                    footer: '<a href="/table">Go to Table page.</a>'

                }).then(function () {
                    location.reload();
                }
                );
            },
        })
    });

}

function stringToArr(string) {

    c_result_arr = string.split(',')

    // * check
    // console.log("result to arr function")
    // console.log(c_result_arr)

    // ? empty arr for sorting
    sort_brand_arr = []
    sort_type_arr = []
    sort_color_arr = []

    // ? sorting c_result_arr
    for (i in c_result_arr) {

        // * check
        // console.log("=== loop : " + i)

        // ? status for insert null
        brand_status = false
        type_status = false
        color_status = false


        // ? foreach loop
        for (i in c_result_arr) {

            // ? empty obj to store each image 
            sort_brand_obj = {}
            sort_type_obj = {}
            sort_color_obj = {}

            // * check
            // console.log("--- each : " + c_result_arr[i])

            // ? sorting brand
            brand_arr.forEach(brand => {
                if (brand == c_result_arr[i]) {

                    // * check
                    console.log("match brand : " + c_result_arr[i])

                    // ? pass match variable
                    sort_brand_obj["brand"] = c_result_arr[i]

                    // ? set staus not insert null
                    brand_status = true
                    sort_brand_arr.push(sort_brand_obj)
                }
                if (brand_status != true) {

                    // * check
                    console.log("brand status != true add null")

                    // ? insert null
                    sort_brand_obj["brand"] = null
                }
            })

            // ? sorting type
            type_arr.forEach(type => {
                if (type == c_result_arr[i]) {

                    // * check
                    // console.log("match type : " + c_result_arr[i])

                    // ? pass match variable
                    sort_type_obj["type"] = c_result_arr[i]

                    // ? set status not insert null
                    type_status = true

                    sort_type_arr.push(sort_type_obj)

                }
                if (type_status != true) {

                    // * check
                    // console.log("type status != true add null")

                    // ? insert null
                    sort_type_obj["type"] = null
                }
            });

            // ? sorting color
            color_arr.forEach(color => {
                if (color == c_result_arr[i]) {

                    // * check
                    // console.log("match color : " + c_result_arr[i])

                    // ? pass sorting variable
                    sort_color_obj["color"] = c_result_arr[i]

                    // ? set status not insert null
                    color_status = true
                    sort_color_arr.push(sort_color_obj)

                }
                if (color_status != true) {

                    // * check
                    // console.log("color status != true add null")

                    // ? insert null
                    sort_color_obj["color"] = null
                }
            });

            // * check
            // console.log("sorting array")
            // console.log(sort_type_arr)
            // console.log(sort_brand_arr)
            // console.log(sort_color_arr)
        }
        // ? push obj to arr
        // sort_brand_arr.push(sort_brand_obj)
        // sort_type_arr.push(sort_type_obj)
        // sort_color_arr.push(sort_color_obj)




        // * check
        // console.log("final sorting +++")
        // console.log(sort_type_arr)
        // console.log(sort_brand_arr)
        // console.log(sort_color_arr)

        return [sort_brand_arr, sort_type_arr, sort_color_arr]

    }

}