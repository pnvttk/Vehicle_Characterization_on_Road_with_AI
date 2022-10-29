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
        // ? html element
        imagebox = $('#imagebox')
        abox = $('#abox')
        cbox = $('#cbox')
        plateBox = $('#plateBox')
        provinceBox = $('#provinceBox')
        input_box = $('#inputBox')

        plateBox.val("")
        provinceBox.val("")
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

                        // ? empty array 
                        plate_arr = ""
                        province_arr = ""


                        // ! new func
                        count = 1
                        for (i in ocr_txt) {
                            // console.log(i + ocr_txt[i])
                            p_elm = document.createElement("p")
                            p_elm.innerHTML = "Car" + count + " :"
                            input_box.append(p_elm)

                            for (key in ocr_txt[i]) {
                                // console.log(key + " : " + ocr_txt[i][key])
                                if (key == "plate") {
                                    input_val = ocr_txt[i][key]
                                    // console.log(plate_arr[i])
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
                                        // console.log(province_arr[i])
                                    }
                                }

                                div_elm = document.createElement("div")
                                div_elm.setAttribute("Class", "form-floating");

                                input_box.append(div_elm)

                                input_elm = document.createElement('input')
                                input_elm.type = "text";
                                input_elm.name = key + i;
                                input_elm.id = key;
                                // input_elm.id = "floatingInput"
                                input_elm.value = input_val
                                input_elm.className = "form-control mt-3 mb-3"

                                div_elm.append(input_elm)

                                label_elm = document.createElement('label')
                                label_elm.setAttribute("for", "floatingInput");
                                label_elm.innerHTML = key
                                label_elm.className = "text-dark"

                                div_elm.append(label_elm)
                            }

                            count += 1
                        }
                        document.getElementById('sendtoDB').style.display = "block";


                        // // ? loop to spilt key 
                        // ocr_txt.forEach(plate => {
                        //     for (let key in plate) {

                        //         // * check
                        //         // console.log("For key in plate :")
                        //         // console.log(`${key}: ${plate[key]}`)

                        //         // ? get value
                        //         ext_txt = `${plate[key]}`
                        //         // ? remove special character
                        //         remove_special_char = ext_txt.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');

                        //         // * test
                        //         // console.log(remove_special_char)
                        //         // new_arr.push(remove_special_char)

                        //         // ? spilt and push to new arr
                        //         if (`${key}` == "plate") {
                        //             // console.log("For key in plate :")
                        //             // console.log(`${key}: ${plate[key]}`)
                        //             // plate_arr.push(`${plate[key]}`)
                        //             plate_arr.push(remove_special_char)
                        //         }
                        //         if (`${key}` == "province") {
                        //             // console.log(`${key}: ${plate[key]}`)
                        //             province_arr.push(remove_special_char)
                        //         }
                        //     }
                        // })

                        // console.log(province_arr)

                        // // ? check if province text == 0
                        // if (province_arr[0] == 0) {
                        //     Swal.fire({
                        //         icon: 'warning',
                        //         title: "Detect successfully.",
                        //         text: "But can't detect some of text, Double check before process.",
                        //     })
                        // } else {
                        //     province_result = province_arr.toString().split(",").join("\n")
                        //     provinceBox.val(province_result)
                        // }

                        // // ? remove "," and create new line
                        // plate_result = plate_arr.toString().split(",").join("\n")

                        // // * check
                        // // console.log(result_arr)

                        // // console.log(province_result)

                        // // ? set value in frontend
                        // plateBox.val(plate_result)
                        // // provinceBox.val(province_result)

                    }

                    // ? if get counts result 
                    if (count_result != undefined) {
                        c_result = count_result.toString().split("\g").join("\n")
                        c_result = c_result.replace("name", "Results")
                        c_result = c_result.replace("dtype: int64", "")
                        // console.log(typeof c_result)
                        cbox.text(c_result)

                        c_result = c_result.replace("Results", "")
                        c_result_remove = c_result.replace(/[0-9]/g, '');
                        c_result_remove = c_result_remove.replace('\t', '');
                        c_result_remove = c_result_remove.replace(/\s/, '');
                        c_result_remove = c_result_remove.replace(/^\s+|\s+$/gm, '');
                        // console.log(c_result_remove)

                        c_result_arr = c_result_remove.split("\n")

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

        var cbox = $('#cbox').val()
        box_path = box_path
        c_result_arr = c_result_arr

        sort_type = []
        sort_brand = []
        sort_color = []
        c_result_arr.forEach(e => {
            type_arr.forEach(type => {
                if (type == e) {
                    sort_type.push(e)
                }
            });
            brand_arr.forEach(brand => {
                if (brand == e) {
                    sort_brand.push(e)
                }
            })
            color_arr.forEach(color => {
                if (color == e) {
                    sort_color.push(e)
                }
            });
        })

        type = sort_type.toString().split(",").join("\n")
        brand = sort_brand.toString().split(",").join("\n")
        color = sort_color.toString().split(",").join("\n")




        var input_form = document.querySelectorAll("#input-form input[type=text]")

        for (var i = 0, element; element = input_form[i++];) {
            if (element.value === "")
                console.log("it's an empty textfield")
        }

        // console.log(input_form)

        input_obj = []
        for (i in input_form) {
            if (input_form[i]["id"] && input_form[i]["value"] != undefined) {
                input_obj.push(input_form[i]["value"])
            }
        }
        // console.log(input_obj)

        arr = [];

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

        console.log(arr);
        data = arr

        // data = []
        // for (i in arr) {
        //     data.push(i, arr[i])
        // }

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

    // $('#sendtoDB').click(() => {


    //     // for (var i = 0, element; element = elements[i++];) {
    //     //     if (element.type === "text" && element.value === "")
    //     //         console.log("it's an empty textfield")
    //     //     console.log(element)
    //     // }

    //     // ? html element
    //     var plateBox = $('#plateBox').val()
    //     var provinceBox = $('#provinceBox').val()
    //     var cbox = $('#cbox').val()
    //     box_path = box_path
    //     c_result_arr = c_result_arr

    //     // * check
    //     // console.log("plate box")
    //     // console.log(plateBox)
    //     // console.log("province box")
    //     // console.log(provinceBox)

    //     sort_type = []
    //     sort_brand = []
    //     sort_color = []
    //     c_result_arr.forEach(e => {
    //         type_arr.forEach(type => {
    //             if (type == e) {
    //                 sort_type.push(e)
    //             }
    //         });
    //         brand_arr.forEach(brand => {
    //             if (brand == e) {
    //                 sort_brand.push(e)
    //             }
    //         })
    //         color_arr.forEach(color => {
    //             if (color == e) {
    //                 sort_color.push(e)
    //             }
    //         });
    //     })

    //     type = sort_type.toString().split(",").join("\n")
    //     brand = sort_brand.toString().split(",").join("\n")
    //     color = sort_color.toString().split(",").join("\n")


    //     // console.log(type)
    //     // console.log(brand)
    //     // console.log(color)

    //     data = {
    //         'plate': plateBox,
    //         'province': provinceBox,
    //         'brand': brand,
    //         'type': type,
    //         'color': color,
    //         'image': box_path
    //     }

    //     // console.log(data)
    //     // const json_data = JSON.stringify(data);
    //     // console.log(json_data)

    //     // ? ajax send to backend
    //     $.ajax({
    //         url: "/sendtoDB",
    //         type: "POST",
    //         contentType: 'application/json',
    //         data: JSON.stringify(data),
    //         dataType: 'json',
    //         // cache: false,
    //         // processData: false,
    //         // contentType: false,

    //         // ? error handle
    //         error: function (response) {
    //             console.log("upload error", response);
    //             console.log(response.getAllResponseHeaders());
    //             console.log(response.responseText)
    //             // ? alert err msg
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Oops...',
    //                 text: "Failed to push to database.",
    //             }).then(function () {
    //                 location.reload();
    //             }
    //             );
    //         },
    //         success: function (response) {
    //             console.log("upload success");
    //             console.log(response);

    //             // ? alert msg
    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Successfully',
    //                 text: 'Upload to database success!',
    //                 footer: '<a href="/table">Go to Table page.</a>'

    //             }).then(function () {
    //                 location.reload();
    //             }
    //             );
    //         },
    //     })
    // })
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