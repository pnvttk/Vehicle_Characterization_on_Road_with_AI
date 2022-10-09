window.onload = () => {
    $('#sendbutton').click(() => {
        imagebox = $('#imagebox')
        abox = $('#abox')
        plateBox = $('#plateBox')
        provinceBox = $('#provinceBox')
        input = $('#imageinput')[0]
        if (input.files && input.files[0]) {
            let formData = new FormData();
            formData.append('image', input.files[0]);
            $.ajax({
                url: "http://localhost:5000/detectObject",
                type: "POST",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                error: function (data) {
                    console.log("upload error", data);
                    console.log(data.getAllResponseHeaders());
                },
                success: function (data) {
                    console.log("upload success");
                    // console.log(data);
                    a_msg = data['alert']
                    bytestring = data['status']
                    ocr_txt = data['json_ocr_txt']
                    // console.log("a_msg : ", a_msg)
                    // console.log("bytestring : ", bytestring)
                    // console.log("ocr_txt : ", ocr_txt)
                    if (bytestring != undefined) {
                        // temp_image_path = data['temp_image']
                        // console.log("temp_image_path :", temp_image_path)
                        abox.attr('href', 'data:image/jpeg;base64,' + bytestring)
                        imagebox.attr('src', 'data:image/jpeg;base64,' + bytestring)
                        // alert('Object detection success.')
                        Swal.fire({
                            icon: 'success',
                            title: 'Successfully',
                            text: 'Obejct Detection have been compleate!',
                        })
                    }
                    if (ocr_txt != undefined) {
                        plate_arr = []
                        province_arr = []
                        ocr_txt.forEach(plate => {
                            for (let key in plate) {
                                // console.log("For key in plate :")
                                // console.log(`${key}: ${plate[key]}`)

                                ext_txt = `${plate[key]}`
                                remove_special_char = ext_txt.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
                                // console.log(remove_special_char)
                                // new_arr.push(remove_special_char)

                                if (`${key}` == "plate") {
                                    // console.log("For key in plate :")
                                    // console.log(`${key}: ${plate[key]}`)
                                    // plate_arr.push(`${plate[key]}`)
                                    plate_arr.push(remove_special_char)
                                }
                                if (`${key}` == "province") {
                                    // console.log(`${key}: ${plate[key]}`)
                                    province_arr.push(remove_special_char)
                                }
                            }
                        })
                        plate_result = plate_arr.toString().split(",").join("\n")
                        province_result = province_arr.toString().split(",").join("\n")
                        // console.log(result_arr)
                        plateBox.val(plate_result)
                        provinceBox.val(province_result)
                        // text_a.val(JSON.stringify(ocr_txt))
                    }
                    if (a_msg != undefined) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: "Object Detection have been failed! \n Look like there isn't Plate or Brand in this image",
                        })
                        // alert("Error : Cannot detect Plate or Brand from this image.")
                    }
                }
            });
        }
    });
};



function readUrl(input) {
    imagebox = $('#imagebox')
    abox = $('#abox')
    console.log("evoked readUrl")
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            // console.log(e)

            imagebox.attr('src', e.target.result);
            abox.attr('href', e.target.result)
            // imagebox.height(500);
            // imagebox.width(800);
        }
        reader.readAsDataURL(input.files[0]);
    }


}