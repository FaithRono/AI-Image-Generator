import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {preview} from '../assets';
import {getRandomPrompt} from '../utils';
import {FormField, Loader} from '../components';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import {FaDownload, FaSave, FaTrashAlt} from 'react-icons/fa';
// import { config } from 'dotenv';
// config();

// const uri = process.env.MONGODB_URI;
const CreatePost = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        prompt: '',
        photos: [],
    });
    const [generatingImg, setGeneratingImg] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPromptEditing, setIsPromptEditing] = useState(false);
    const [tempPrompt, setTempPrompt] = useState('');
    const [recentCreations, setRecentCreations] = useState([]);
    const [showRecentCreations, setShowRecentCreations] = useState(false);
    const [photosToShare] = useState([])

    const {transcript, isListening, startListening, stopListening} = useSpeechRecognition();

    // Update the prompt field based on the speech transcript
    useEffect(() => {
        if (transcript) {
            setTempPrompt(transcript);
            setForm({...form, prompt: transcript});
        }
    }, [transcript]);

    // Fetch images from MongoDB when the component mounts
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/images');
                const data = await response.json();
                setRecentCreations(data);
            } catch (err) {
                console.error('Error fetching images:', err);
            }
        };

        fetchImages();
    }, []);

    const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});

    const handleSurpriseMe = () => {
        const randomPrompt = getRandomPrompt(form.prompt);
        setForm({...form, prompt: randomPrompt});
        setTempPrompt(randomPrompt);
        setIsPromptEditing(false);
    };

    // Generate an image based on the prompt and save it to MongoDB
    const generateImage = async () => {
        if (form.prompt) {
            // console.log(form);
            try {
                setGeneratingImg(true);
                const response = await fetch('https://api.openai.com/v1/images/generations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                    },
                    body: JSON.stringify({
                        prompt: form.prompt,
                        n: 2, // Generate 2 images
                        size: '1024x1024',
                    }),
                });
                const data = await response.json();
                if (data.data && data.data.length) {
                    const newPhotos = data.data.map((item) => ({
                        url: item.url,
                        prompt: form.prompt,
                        name: form.name,
                    }));
                    setForm({...form, photos: newPhotos});
                    setRecentCreations((prev) => [...prev, ...newPhotos]);
                    //TODO("Get button to select the image to be shared to the community")
                    //TODO("Make sure to update photosToShare with the selected images")

                    // Save images to MongoDB
                    // await Promise.all(newPhotos.map(async (photo) => {
                    //   try {
                    //     await fetch('http://localhost:3000/api/images', {
                    //       method: 'POST',
                    //       headers: {
                    //         'Content-Type': 'application/json',
                    //       },
                    //       body: JSON.stringify(
                    //           {
                    //             prompt: form.prompt,
                    //             name: form.name,
                    //             url: photo.url,
                    //           }
                    //       ),
                    //     });
                    //   } catch (err) {
                    //     console.error('Error saving image:', err);
                    //   }
                    // }));
                } else {
                    alert('Invalid photo data received from the API.');
                }
            } catch (err) {
                alert('Error generating image');
                console.error('Error generating image:', err);
            } finally {
                setGeneratingImg(false);
            }
        } else {
            alert('Please enter a prompt');
        }
    };

    //TODO("Review code for adding and removing photos to share")
    const updatePhotosToShare = (photo, isAdded) => {
        // Get id from photo
        const photoId = photo.id;
        if (isAdded) {
            // Add photo to photosToShare
            photosToShare.push(photoId);
        } else {
            // Remove photo from photosToShare
            const index = photosToShare.indexOf(photoId);
            if (index > -1) {
                photosToShare.splice(index, 1);
            }
        }
    }
    // Submit and share the images with the community
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.prompt && photosToShare.length) {
            setLoading(true);
            try {
                await Promise.all(photosToShare.map(async (photo) => {
                    await fetch('http://localhost:3000/api/posts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(
                            {
                                prompt: form.prompt,
                                name: form.name,
                                url: photo.url,
                            }
                        ),
                    });
                }));

                alert('Success');
                navigate('/');
            } catch (err) {
                alert(err);
            } finally {
                setLoading(false);
            }
        } else {
            alert('Please generate an image with valid details');
        }
    };


    const handlePromptClick = () => {
        setTempPrompt('');
        setIsPromptEditing(true);
    };

    const handlePromptBlur = () => {
        setIsPromptEditing(false);
        setForm({...form, prompt: tempPrompt});
    };

    const handleVoiceTyping = () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    };

    const handleShowRecentCreations = () => {
        setShowRecentCreations(!showRecentCreations);
    };

    // Save photo locally
    const handleSavePhoto = (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = url.substring(url.lastIndexOf('/') + 1);
        a.click();
        alert('Photo saved to your local machine!');
    };

    // Download photo
    const handleDownloadPhoto = (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = url.substring(url.lastIndexOf('/') + 1);
        a.click();
    };

    // Delete photo from recent creations and MongoDB
    const handleDeletePhoto = async (url) => {
        const updatedPhotos = recentCreations.filter((photo) => photo.url !== url);
        setRecentCreations(updatedPhotos);

        try {
            await fetch('http://localhost:3000/api/images', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({url}),
            });
            alert('Photo deleted!');
        } catch (err) {
            console.error('Error deleting photo:', err);
        }
    };

    return (
        <section className="container mx-auto p-6 bg-gradient-to-r from-blue-500 to-purple-600 min-h-screen">
            <div className="text-center">
                <h1 className="text-5xl font-extrabold text-white mb-4 transform transition-transform duration-500 ease-in-out hover:scale-105">
                    Make Your Fantasy Real
                </h1>
                <p className="mt-4 text-gray-100 text-lg">
                    Harness the power of AI to craft stunning visuals and showcase your creativity to the world.
                </p>
            </div>

            <form className="mt-10 bg-gradient-to-r from-pink-300 via-teal-300 to-blue-300 shadow-md rounded-lg p-8"
                  onSubmit={handleSubmit}>
                <div className="mb-6">
                    <FormField
                        labelName="Your Name"
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={form.name}
                        handleChange={handleChange}
                    />
                </div>

                <div className="mb-6">
                    <div className="flex items-center">
                        <FormField
                            labelName="Prompt"
                            type="text"
                            name="prompt"
                            placeholder="Enter a prompt to generate image"
                            value={isPromptEditing ? tempPrompt : form.prompt}
                            handleChange={(e) => setTempPrompt(e.target.value)}
                            onFocus={handlePromptClick}
                            onBlur={handlePromptBlur}
                            className="w-full p-2 border rounded"
                        />
                        <button
                            type="button"
                            onClick={handleSurpriseMe}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 mr-4"
                        >
                            Surprise Me!
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <button
                        type="button"
                        onClick={generateImage}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 mr-4"
                        disabled={generatingImg}
                    >
                        {generatingImg ? 'Generating...' : 'Generate Image'}
                    </button>

                    <button
                        type="button"
                        onClick={handleVoiceTyping}
                        className={`bg-gradient-to-r ${isListening ? 'from-red-500 to-red-700' : 'from-green-400 to-blue-500'} hover:from-blue-500 hover:to-green-400 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                        {isListening ? 'Listening...' : 'Voice Typing'}
                    </button>
                </div>

                <div className="relative">
                    {generatingImg ? (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                            <Loader/>
                        </div>
                    ) : form.photos.length > 0 ? (
                        form.photos.map((photo, index) => (
                            <div key={index} className="relative">
                                <img src={photo.url} alt={photo.prompt}
                                     className="rounded-lg shadow-md w-full object-cover mb-4"/>
                            </div>
                        ))
                    ) : (
                        <img src={preview} alt="preview" className="w-full h-64 object-contain opacity-40"/>
                    )}
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className="bg-red-500 text-white font-bold py-2 px-6 rounded hover:bg-red-600 transform transition-transform duration-500 ease-in-out hover:scale-110"
                    >
                        {loading ? 'Sharing...' : 'Share with Community'}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <button
                    onClick={handleShowRecentCreations}
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-orange-500 hover:to-yellow-400 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    {showRecentCreations ? 'Hide Recent Creations' : 'Show Recent Creations'}
                </button>
            </div>

            {showRecentCreations && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    {recentCreations.map((photo, index) => (
                        <div key={index} className="relative group">
                            <img src={photo.url} alt={photo.prompt}
                                 className="rounded-lg shadow-md w-full object-cover mb-4"/>
                            <div
                                className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button onClick={() => handleSavePhoto(photo.url)} className="text-white">
                                    <FaSave size={20}/>
                                </button>
                                <button onClick={() => handleDownloadPhoto(photo.url)} className="text-white">
                                    <FaDownload size={20}/>
                                </button>
                                <button onClick={() => handleDeletePhoto(photo.url)} className="text-white">
                                    <FaTrashAlt size={20}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
};

export default CreatePost;
