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
    $('#sendbutton').click(() => {

        // ? image preview
        imagebox = $('#imagebox')

        // ? featherlight img popup
        abox = $('#abox')

        // ? count result
        cbox = $('#cbox')

        // ? input 
        input_box = $('#inputBox')

        // ? set text field value to empty
        input_box.empty()

        // ? Get image input
        input = $('#imageinput')[0]

        // ? if get input
        if (input.files && input.files[0]) {

            // ? payload to backend
            let formData = new FormData();
            formData.append('image', input.files[0]);

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

                    // ? get data from flask
                    a_msg = data['alert']
                    bytestring = data['status']
                    ocr_txt = data['json_ocr_txt']
                    box_path = data['box_path']
                    count_result = data['count_result']

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
                            p_elm.innerHTML = "Car" + count + " :"

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

                    // ? if get counts result 
                    if (count_result != undefined) {

                        // ? rearrange text
                        c_result = count_result.toString().split("\g").join("\n")
                        c_result = c_result.replace("name", "Results")
                        c_result = c_result.replace("dtype: int64", "")

                        // ? set text in cbox
                        cbox.text(c_result)

                        // ? remove number for input name
                        c_result = c_result.replace("Results", "")
                        c_result_remove = c_result.replace(/[0-9]/g, '');
                        c_result_remove = c_result_remove.replace('\t', '');
                        c_result_remove = c_result_remove.replace(/\s/, '');
                        c_result_remove = c_result_remove.replace(/^\s+|\s+$/gm, '');

                        // * check
                        // console.log(c_result_remove)

                        // ? create new line 
                        c_result_arr = c_result_remove.split("\n")

                        // * check
                        // console.log(c_result_arr)
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
            });
        }
    });

    $('#sendtoDB').click(() => {

        // ? get value
        box_path = box_path
        c_result_arr = c_result_arr

        // ? empty arr for sorting
        sort_type = []
        sort_brand = []
        sort_color = []

        // ? sorting c_result_arr
        c_result_arr.forEach(e => {

            // ? sorting type
            type_arr.forEach(type => {
                if (type == e) {
                    sort_type.push(e)
                }
            });

            // ? sorting brand
            brand_arr.forEach(brand => {
                if (brand == e) {
                    sort_brand.push(e)
                }
            })

            // ? sorting color
            color_arr.forEach(color => {
                if (color == e) {
                    sort_color.push(e)
                }
            });
        })

        // ? from sorting create new line
        type = sort_type.toString().split(",").join("\n")
        brand = sort_brand.toString().split(",").join("\n")
        color = sort_color.toString().split(",").join("\n")

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

        // ? empty arr
        arr = [];

        // ? form input_obj create new data_arr
        for (var i = 0; i < input_obj.length; i += 2) {
            var obj = {};
            obj['plate'] = input_obj[i];
            obj['province'] = input_obj[i + 1];
            obj['brand'] = brand
            obj['type'] = type
            obj['color'] = color
            obj['image'] = box_path
            arr.push(obj);
        }

        // * check
        console.log(arr);

        // ? store arr in data 
        data = arr

        // data = []
        // for (i in arr) {
        //     data.push(i, arr[i])
        // }

        // * check
        console.log(data);
        // data = {
        //     'plate': plateBox,
        //     'province': provinceBox,
        //     'brand': brand,
        //     'type': type,
        //     'color': color,
        //     'image': box_path
        // }

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

                console.log("upload success");
                console.log(response);

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

function readUrl(input) {

    // ? html elment
    imagebox = $('#imagebox')
    abox = $('#abox')

    // * check
    // console.log("evoked readUrl")

    // ? if get image input
    if (input.files && input.files[0]) {

        // ? read file
        let reader = new FileReader();
        reader.onload = function (e) {

            // * log event
            // console.log(e)

            // ? image preview
            imagebox.attr('src', e.target.result);
            abox.attr('href', e.target.result)
            // imagebox.height(500);
            // imagebox.width(800);
        }
        reader.readAsDataURL(input.files[0]);
    }


}