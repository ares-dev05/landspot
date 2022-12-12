import {post} from 'axios';

$('#content').summernote({
    height: 300,
    minHeight: null,
    maxHeight: null,
    focus: true,
    toolbar: [
        ['misc', ['undo', 'redo', 'fullscreen', 'codeview']],
        ['style', ['bold', 'italic', 'underline', 'clear']],
        ['font', ['strikethrough', 'superscript', 'subscript']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph', 'style']],
        ['height', ['height']],
        ['insert', ['picture', 'link', 'video', 'table', 'hr']],
    ],
    fontSizes: ['8', '9', '10', '11', '12', '14', '16', '18', '20', '22', '24', '28', '32', '36', '42', '48' , '64'],
    callbacks: {
        onImageUpload: function (files) {
            for (let i = files.length - 1; i >= 0; i--) {
                const editor = this;
                sendFile(files[i], editor).then((response) => {
                    const image = response.data;
                    if (image.id) {
                        const node = $('<img>').attr('src', image.smallImage)
                            .attr('title', image.name);
                        $(editor).summernote("insertNode", node[0]);
                    }
                });
            }
        }
    }
});

const sendFile = (file, el) => {
    const formData = new FormData();
    formData.append('image', file);
    return post('/insights/admin/media', formData);
};

// Toggle the side navigation
$("#sidenavToggler").click(function (e) {
    e.preventDefault();
    $("body").toggleClass("sidenav-toggled");
});

// Configure tooltips for collapsed side navigation
$('.navbar-sidenav [data-toggle="tooltip"]').tooltip({
    template: '<div class="tooltip navbar-sidenav-tooltip" role="tooltip"><div class="arrow"></div><div class="tooltip-inner"></div></div>'
});

$('[data-confirm]').on('click', function () {
    return confirm($(this).data('confirm'))
});