function edit() {
    //设置界面预览
    $('#edit').on('froalaEditor.contentChanged froalaEditor.initialized', function (e, editor) {
        $('#preview').html(editor.html.get());
        var froalaEditor = editor;
    }).froalaEditor({
        imageUploadURL: 'http://localhost:8177/marker/saveReportFile',
        videoUploadURL: 'http://localhost:8177/marker/saveReportFile',
        fileUploadURL: 'http://localhost:8177/marker/saveReportFile',
        imageUploadMethod: 'POST',
        videoUploadMethod: 'POST',
        fileUploadMethod: 'POST',
        language: 'zh_cn', // 设置语言为中文
    });
};