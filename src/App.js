import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import Spinner from './Spinner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons';


function App() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [audioFile, setAudioFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [audios, setAudios] = useState(null);
  const [fileName, setFileName] = useState('');
  const [percentComplete, setPercentComplete] = useState('');
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);


  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setAudioFile(file);
    setFileName(file.name);
  };

  const getAllAudios = async () => {
    const response = await fetch(`${apiUrl}/api/get-all-audios`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const audios = await response.json();
    setAudios(audios.reverse());
  }

  const uploadAudio = async () => {
    setProcessing(true);
    if (audioFile) {
      const formData = new FormData();
      formData.append('file', audioFile);
      formData.append('upload_preset', 'my-preset');

      const response = await axios.post(
        `${process.env.REACT_APP_CLOUDINARY_API}`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPercentComplete(`${percentCompleted}%`);

          },
        }
      );

      await axios.post(
        `${apiUrl}/api/upload-audio`,
        {
          audioUrl: await response.data.secure_url,
          public_id: await response.data.public_id,
          fileName: fileName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then(response => {
          if (response.data.success) {
            window.location.reload();
            setProcessing(false);
          } else {
            setProcessing(false);
          }
        })
        .catch(error => {
          console.log(error);
          setProcessing(false);
        })
    } else {
      console.error('No file selected');
    }
  }

  const playNextAudio = async (index) => {
    if (index !== await audios.length) {
      document.getElementById(index).play();
      localStorage.setItem('currentAudioIndex', currentAudioIndex);
    } else {
      console.log('Playlist songs ended');
    }
  };
  const handleTimeUpdate = (audioElement) => {
    localStorage.setItem('currentPlaybackPosition', audioElement.currentTime);
  };

  const handlePlay = async (index) => {
    setCurrentAudioIndex(index);
    if (index != localStorage.getItem('currentAudioIndex')) {
      localStorage.removeItem('currentPlaybackPosition');
    }
    localStorage.setItem('currentAudioIndex', index);
    for (let i = 0; i < audios.length; i++) {
      const audioElement = document.getElementById(i);
      if (index === i) {
        audioElement.currentTime = localStorage.getItem('currentPlaybackPosition');
        await audioElement.play();
        audioElement.addEventListener('ended', () => playNextAudio(index + 1));
        audioElement.addEventListener('timeupdate', () => handleTimeUpdate(audioElement));
      } else {
        await audioElement.pause();
      }
    }
  }

  useEffect(() => {
    getAllAudios();
  }, []);

  return (
    <>
      <div className="container min-w-350 margin-top-100 bg-light rounded-4 px-0 pb-5">
        <h1 className='dfjcac bg-danger text-light py-3 btlr-4 btrr-4'>Mp3 Audio Player <span>&nbsp; <FontAwesomeIcon style={{color:'#edda07'}} icon={faCompactDisc} /></span></h1>
        <div className="row p-3 rounded-2 mb-2 w-75 margin-auto border bg-light border">
          <div className="col-6 dfjlac">
            <input type="file" id="upload" title="Upload File" onChange={handleFileChange} />
          </div>
          <div className="col-6 dfjeac">
            <span className='text-success bold'>{percentComplete}</span> &nbsp;
            <button disabled={audioFile == null} className='btn btn-warning' onClick={uploadAudio}>
              {processing == true ? <Spinner width='20' height='20' /> : 'Upload Audio'}
            </button>
          </div>
        </div>
        <div className="row mb-4 py-2 w-100 px-3 margin-auto bold fs-3">Playlist</div>
        {audios == null && <div className='container dfjcac py-3'><Spinner height='70' width='70' /></div>}
        {audios !== null && (audios.length !== 0 ? audios.map((audio, index) => {
          return (
            <div key={index} className={`row mt-2 margin-auto py-1 rounded-4 mx-4 border ${index == localStorage.getItem('currentAudioIndex')? 'row-box-shadow': ''}`}>
              <div className="col-lg-6 dfjlac">
                <div className="row">
                  <div className="col-1">
                  <FontAwesomeIcon style={{color:`${index == localStorage.getItem('currentAudioIndex')? '#edda07': ''}`}} icon={faCompactDisc} />
                  </div>
                  <div className="col-11"><span className='bold'>{audio.fileName}</span></div>
                </div>
                </div>
              <div className="col-lg-6">
                <div className='dfjeac my-1'>
                  <audio className='audio-player' controls id={`${index}`} onPlay={() => { handlePlay(index) }}>
                    <source src={audio.audioUrl} type="audio/mp3" />
                  </audio>
                </div>
              </div>
            </div>
          )
        }) :
          <div className='row py-3 rounded-4'>
            <div className='col dfjcac'><span className='fs-5 text-secondary'>----No Audios----</span>
            </div>
          </div>)}
      </div>
      <div className="container">
            <h6 className='mt-2 dfjcac text-secondary'>Developed by MD ADIL ALAM</h6>
          </div>

    </>
  );
}

export default App;
