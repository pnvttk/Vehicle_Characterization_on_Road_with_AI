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

window.onload = () => {

    //Check File API support
    if (window.File && window.FileList && window.FileReader) {

        // ? get file input 
        var filesInput = document.getElementById("imageinput");

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

                    // ? loop all data from payload
                    for (i in data) {

                        // * check
                        // console.log(i)
                        // console.log(data[i])

                        // ? get data from flask
                        a_msg = data[i]['alert']
                        bytestring = data[i]['status']
                        ocr_txt = data[i]['json_ocr_txt']
                        count_result = data[i]['count_result']
                        box_path.push(data[i]['box_path'])

                        // ? create h element 
                        h_elm = document.createElement("h3")

                        // ? set header number for image
                        num = parseInt(i) + 1
                        h_elm.innerHTML = "Image " + num + " :"

                        // ? append h element to id input_box
                        input_box.append(h_elm)

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
                            input_box.append(p_result)

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
                        if (ocr_txt != undefined) {

                            // ? show upload to db button
                            document.getElementById('sendtoDB').style.display = "block";

                            // ? empty array 
                            plate_arr = ""
                            province_arr = ""

                            // ! new func
                            count = 1
                            for (i in ocr_txt) {

                                // *check
                                // console.log(i + ocr_txt[i])

                                // ? create p element 
                                p_elm = document.createElement("p")

                                // ? set text inside
                                p_elm.innerHTML = "Car " + count + " :"

                                // ? append p element to id input_box
                                input_box.append(p_elm)

                                // ? Loop get all data from ocr_text
                                for (key in ocr_txt[i]) {

                                    // * check
                                    // console.log(key + " : " + ocr_txt[i][key])

                                    if (key == "plate") {
                                        input_val = ocr_txt[i][key]
                                    }

                                    if (key == "province") {

                                        // ? check if province text == null
                                        if (ocr_txt[i][key] == null) {

                                            input_val = "-"

                                            Swal.fire({
                                                icon: 'warning',
                                                title: "Detect successfully.",
                                                text: "But can't detect some text, Double check before process.",
                                            })
                                        } else {
                                            input_val = ocr_txt[i][key]
                                        }
                                    }

                                    // ? create div elemnt for input field
                                    div_elm = document.createElement("div")

                                    // ? class bootstap floating text
                                    div_elm.setAttribute("Class", "form-floating");

                                    // ? appaend to input_box
                                    input_box.append(div_elm)

                                    // ? create input element
                                    input_elm = document.createElement('input')

                                    // ? set attr
                                    input_elm.type = "text";
                                    input_elm.name = key + i;
                                    input_elm.id = key;
                                    // input_elm.id = "floatingInput"
                                    input_elm.value = input_val
                                    input_elm.className = "form-control mt-3 mb-3"

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
                            }
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

        // ? get value
        box_path = box_path
        c_result_arr = c_result_arr

        // * check
        // console.log("box path =")
        // console.log(box_path)
        // console.log("c_ result =")
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

            // ? empty obj to store each image 
            sort_brand_obj = {}
            sort_type_obj = {}
            sort_color_obj = {}

            // ? foreach loop
            c_result_arr[i].forEach(e => {

                // * check
                // console.log("--- each : " + e)

                // ? sorting brand
                brand_arr.forEach(brand => {
                    if (brand == e) {

                        // * check
                        // console.log("match brand : " + e)

                        // ? pass match variable
                        sort_brand_obj["brand"] = e

                        // ? set staus not insert null
                        brand_status = true
                    }
                    if (brand_status != true) {

                        // * check
                        // console.log("brand status != true add null")

                        // ? insert null
                        sort_brand_obj["brand"] = null
                    }
                })

                // ? sorting type
                type_arr.forEach(type => {
                    if (type == e) {

                        // * check
                        // console.log("match type : " + e)

                        // ? pass match variable
                        sort_type_obj["type"] = e

                        // ? set status not insert null
                        type_status = true
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
                    if (color == e) {

                        // * check
                        // console.log("match color : " + e)

                        // ? pass sorting variable
                        sort_color_obj["color"] = e

                        // ? set status not insert null
                        color_status = true
                    }
                    if (color_status != true) {

                        // * check
                        // console.log("color status != true add null")

                        // ? insert null
                        sort_color_obj["color"] = null
                    }
                });

                // * check
                // console.log(sort_type_arr)
                // console.log(sort_brand_arr)
                // console.log(sort_color_arr)
            })

            // ? push obj to arr
            sort_brand_arr.push(sort_brand_obj)
            sort_type_arr.push(sort_type_obj)
            sort_color_arr.push(sort_color_obj)


        }

        // * check
        // console.log(sort_type_arr)
        // console.log(sort_brand_arr)
        // console.log(sort_color_arr)

        // ? get all input field in #input-form
        var input_form = document.querySelectorAll("#input-form input[type=text]")

        // ? loop get all element inside div
        for (var i = 0, element; element = input_form[i++];) {
            if (element.value === "")
                console.log("it's an empty textfield")
        }

        // * check
        // console.log(input_form)

        // ? empty input arr
        input_obj = []

        // ? loop get only id, value
        for (i in input_form) {
            if (input_form[i]["id"] && input_form[i]["value"] != undefined) {
                input_obj.push(input_form[i]["value"])
            }
        }

        // * check
        // console.log(input_obj)
        // console.log(box_path)

        // ? empty arr
        arr = [];

        // ? loop create obj data
        j = 0
        for (var i = 0; i < input_obj.length; i += 2) {

            // ? some of field increment is not match
            // ? use j instead of i
            if (i > j) {
                j = j + 1
            }

            // * check
            // console.log("i = " + i)
            // console.log("j = " + j)

            // ? create empty obj in loop
            var obj = {};

            obj['plate'] = input_obj[i];
            obj['province'] = input_obj[i + 1];

            obj['image'] = box_path[j]

            // * check
            console.log(sort_brand_arr[i])

            // ? if get null set to "-"
            if (sort_brand_arr[j] != null) {
                brand = sort_brand_arr[j]['brand']
            } else {
                brand = "-"
            }
            obj['brand'] = brand

            // ? if get null set to "-"
            console.log(sort_type_arr[i])
            if (sort_type_arr[j] != null) {
                type = sort_type_arr[j]['type']
            } else {
                type = "-"
            }
            obj['type'] = type

            // ? if get null set to "-"
            console.log(sort_color_arr[i])
            if (sort_color_arr[j] != null) {
                color = sort_color_arr[j]['color']
            } else {
                color = "-"
            }
            obj['color'] = color

            // ? push obj in arr
            arr.push(obj);
        }

        // * check
        // console.log(arr);

        // ? store arr in data 
        data = arr

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
                // console.log("upload success");
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
    })
};
