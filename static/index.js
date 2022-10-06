window.onload = () => {
    $('#sendbutton').click(() => {
        imagebox = $('#imagebox')
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
                    bytestring = data['status']
                    // console.log("image :", bytestring)
                    imagebox.attr('src', 'data:image/jpeg;base64,' + bytestring)
                }
            });
        }
    });
};



function readUrl(input) {
    imagebox = $('#imagebox')
    console.log("evoked readUrl")
    if (input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function (e) {
            console.log(e)

            imagebox.attr('src', e.target.result);
            imagebox.height(500);
            imagebox.width(800);
        }
        reader.readAsDataURL(input.files[0]);
    }


}