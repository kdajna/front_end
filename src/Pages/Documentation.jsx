import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom';
const Documentation = () => {
    const id = useParams()
    const [html,setHtml]  = useState("");
    useEffect(()=>{
        axios.get(`http://localhost:8080/api/sdk/getSdkDetails?id=${id}`).then((res)=>{
               setHtml(res.data.data.details[0].document)
               console.log(res.data.data.details);
        }).catch((err)=>{
           console.log("err",err);
        })

    },[])
    const creatingDocumetation =()=>{
        console.log(html)
    }
  return (
    <div>
        <h1>Documentation</h1>
        <button onClick={creatingDocumetation}>Generate</button>
        <div dangerouslySetInnerHTML={{ __html: html}}/>
    </div>

  )
}

export default Documentation