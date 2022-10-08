window.onload = () => {
    $('#sendbutton').click(() => {
        imagebox = $('#imagebox')
        abox = $('#abox')
        text_a = $('#ocr_txt')
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
                    console.log(data);
                    a_msg = data['alert']
                    bytestring = data['status']
                    ocr_txt = data['ocr_txt']
                    // console.log("a_msg : ", a_msg)
                    // console.log("bytestring : ", bytestring)
                    console.log("ocr_txt : ", ocr_txt)
                    if (bytestring != undefined) {
                        // temp_image_path = data['temp_image']
                        // console.log("temp_image_path :", temp_image_path)
                        // ocr_txt.split(',').join('\n');

                        new_arr = []
                        ocr_txt.forEach(plate => {
                            for (let key in plate) {
                                // console.log(`${key}: ${plate[key]}`)
                                new_arr.push(`${plate[key]}`)
                            }
                        })

                        result_arr = new_arr.toString().split(",").join("\n")
                        // console.log(result_arr)
                        text_a.val(result_arr)
                        // text_a.val(JSON.stringify(ocr_txt))
                        abox.attr('href', 'data:image/jpeg;base64,' + bytestring)
                        imagebox.attr('src', 'data:image/jpeg;base64,' + bytestring)
                        alert('Object detection success.')
                    }
                    if (a_msg != undefined) {
                        alert("Error : Cannot detect Plate or Brand from this image.")
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
            console.log(e)

            imagebox.attr('src', e.target.result);
            abox.attr('href', e.target.result)
            // imagebox.height(500);
            // imagebox.width(800);
        }
        reader.readAsDataURL(input.files[0]);
    }


}