import React, { useRef, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const DocEditor = () => {
  const navigate = useNavigate();
  const editorRef = useRef(null);
  const [file, setFile] = useState({});
  const [payload, setPayload] = useState({
    sdkName: "",
    version: "",
    sdkFile: "",
    document: "",
  });
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setPayload((state) => ({
      ...state,
      [name]: value,
    }));
  };

  // fn for setup sdk file 
  const uploadFileMini = (e) => {
    let fileData = e.target.files[0];
    setFile(fileData);
  };

  //function for uploading sdk file on minio;
  const handleUpload = () => {
    const data = new FormData();
    data.append("sdkFile", file);

    axios
      .post("http://localhost:8080/api/sdk/uploadsdkfile", data)
      .then((res) => {
        console.log("hello");
        console.log("RESPONSE RECEIVED: ", res.data.data.link);
        setPayload((state) => ({
          ...state,
          sdkFile : res.data.data.link,
        }));

      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      });

  };
  
  //function for uploading media file of editor in minio;
  const uploadMediaFile = async (blobInfo)=>{
    const formData = new FormData();
    formData.append("media",blobInfo.blob());
    try {
      let res = await axios.post("http://localhost:8080/api/sdk/uploadmediafile", formData);
      console.log(res);
      let url = res.data?.data?.link;
      return url
      
    } catch (error) {
       console.log('error',error)
    }
  }

  const log = async () => {
    if (editorRef.current) {
      const doc = editorRef.current.getContent();
      setPayload((state) => ({
        ...state,
        document : doc,
      }));
      console.log("payload",payload);
    }
  };

  // Posting data on database.
  const publish=()=>{
   if(payload.sdkFile&&payload.document&&payload.sdkName&&payload.version){
    axios
      .post("http://localhost:8080/api/sdk/uploadSdk", payload)
      .then((res) => {
        console.log("RESPONSE RECEIVED: ", res);
        const publishedId = res.data.data._id;
          console.log(publishedId);
          navigate(`/${publishedId}`)
      })
      .catch((err) => {
        console.log("AXIOS ERROR: ", err);
      });
    }else{
      alert("fill all the fields")
    }
  }

  return (
    <>
      <div>
        <label htmlFor="">Name of the SDK</label>
        <input
          type="text"
          name="sdkName"
          value={payload.sdkName}
          onChange={handleChange}
        />
        <label htmlFor="">Version</label>
        <input
          type="text"
          name="version"
          value={payload.version}
          onChange={handleChange}
        />
        <label htmlFor="uSdk">Upload sdk here</label>

        <input
          type="file"
          name="sdkFile"
          accept=".zip,.rar,.7zip"
          onChange={uploadFileMini}
        />
        <button onClick={handleUpload}>Upload File</button>
      </div>
      <h3>Usage Instruction</h3>
      <Editor
        apiKey="qwke6mub0whmuay0ysh7bmjzrqafos13w4tbllvlnj8jp6cq"
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue="<p>This is the initial content of the editor.</p>"
        init={{
          height: 500, 
         menu: {
            file: {
              title: "File",
              items:
                "newdocument restoredraft | preview | export print | deleteallconversations",
            },
            edit: {
              title: "Edit",
              items:
                "undo redo | cut copy paste pastetext | selectall | searchreplace",
            },
            view: {
              title: "View",
              items:
                "code | visualaid visualchars visualblocks | spellchecker | preview fullscreen | showcomments",
            },
            insert: {
              title: "Insert",
              items:
                "image link media addcomment pageembed template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor tableofcontents | insertdatetime",
            },
            format: {
              title: "Format",
              items:
                "bold italic underline strikethrough superscript subscript codeformat | styles blocks fontfamily fontsize align lineheight | forecolor backcolor | language | removeformat",
            },
            tools: {
              title: "Tools",
              items:
                "spellchecker spellcheckerlanguage | a11ycheck code wordcount",
            },
            table: {
              title: "Table",
              items:
                "inserttable | cell row column | advtablesort | tableprops deletetable",
            },
            help: { title: "Help", items: "help" },
          },
          file_picker_types: 'file image media',
        file_picker_callback: function (cb, value, meta) {
              let input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "video/*");
              input.onchange = function () {
                let file = this.files[0];
                 console.log("video file",file)
                let reader = new FileReader();
                reader.onload = function () {
                  let id = "blobid" + new Date().getTime();
                  let blobCache = editorRef.current.editorUpload.blobCache;
                  let base64 = reader.result.split(",")[1];
                  let blobInfo = blobCache.create(id, file, base64);
                  blobCache.add(blobInfo);

                  /* call the callback and populate the Title field with the file name */
                  uploadMediaFile(blobInfo).then((res) => {
                    
                    cb(res, { title: file.name });
                  })
                };
                reader.readAsDataURL(file);
              };
              input.click();
            },

          plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "preview",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "code",
            "help",
            "wordcount",
            "editimage",
          ],
          toolbar:
            'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media |  "removeformat | forecolor backcolor emoticons | help',
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
        }}
      />
      <button onClick={log}>Save</button>
      <button onClick={publish}>Publish</button>
    </>
  );
};

export default DocEditor;
