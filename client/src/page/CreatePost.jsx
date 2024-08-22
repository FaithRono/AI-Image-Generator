import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { preview } from '../assets';
import { getRandomPrompt } from '../utils';
import { FormField, Loader } from '../components';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { FaDownload, FaSave, FaTrashAlt } from 'react-icons/fa';

const CreatePost = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        prompt: '',
        photos: [],
    });
    const [generatingImg, setGeneratingImg] = useState(false);
    const [loading, setLoading] = useState(false);
    const [recentImages, setRecentImages] = useState([]); // Renamed from recentCreations for clarity
    const [isPromptEditing, setIsPromptEditing] = useState(false);
    const [tempPrompt, setTempPrompt] = useState('');
    const [showRecentCreations, setShowRecentCreations] = useState(false);
    const [photosToShare, setPhotosToShare] = useState([]);

    const { transcript, isListening, startListening, stopListening } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            setTempPrompt(transcript);
            setForm({ ...form, prompt: transcript });
        }
    }, [transcript]);

    useEffect(() => {
        const fetchRecentImages = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/images');
                if (response.ok) {
                    const images = await response.json();
                    setRecentImages(images);
                } else {
                    console.error('Failed to fetch recent images');
                }
            } catch (error) {
                console.error('Error fetching recent images:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecentImages();
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSurpriseMe = () => {
        const randomPrompt = getRandomPrompt(form.prompt);
        setForm({ ...form, prompt: randomPrompt });
        setTempPrompt(randomPrompt);
        setIsPromptEditing(false);
    };

    const generateImage = async () => {
        if (form.prompt) {
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
                        n: 2,
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
                    setForm({ ...form, photos: newPhotos });
                    setRecentImages((prev) => [...newPhotos, ...prev.slice(0, 4)]); // Update recent images with new photos

                    // Save images to MongoDB
                    await Promise.all(newPhotos.map(async (photo) => {
                        try {
                            await fetch('http://localhost:3000/api/images', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    prompt: form.prompt,
                                    name: form.name,
                                    url: photo.url,
                                }),
                            });
                        } catch (err) {
                            console.error('Error saving image:', err);
                        }
                    }));
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

    const updatePhotosToShare = (photoUrl, isAdded) => {
        if (isAdded) {
            setPhotosToShare([...photosToShare, photoUrl]);
        } else {
            setPhotosToShare(photosToShare.filter((url) => url !== photoUrl));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.prompt && photosToShare.length) {
            setLoading(true);
            try {
                await Promise.all(photosToShare.map(async (url) => {
                    await fetch('http://localhost:3000/api/posts', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            prompt: form.prompt,
                            name: form.name,
                            url: url,
                        }),
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
        setTempPrompt(form.prompt);
        setIsPromptEditing(true);
    };

    const handlePromptChange = (e) => {
        setTempPrompt(e.target.value);
    };

    const handlePromptBlur = () => {
        setIsPromptEditing(false);
        setForm({ ...form, prompt: tempPrompt });
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

    const handleSavePhoto = (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = url.substring(url.lastIndexOf('/') + 1);
        a.click();
        alert('Photo saved to your local machine!');
    };

    const handleDownloadPhoto = (url) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = url.substring(url.lastIndexOf('/') + 1);
        a.click();
    };

    const handleDeletePhoto = async (url) => {
        const updatedPhotos = recentImages.filter((photo) => photo.url !== url);
        setRecentImages(updatedPhotos);

        try {
            await fetch('http://localhost:3000/api/images', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url }),
            });
            alert('Photo deleted!');
        } catch (err) {
            console.error('Error deleting photo:', err);
        }
    };

    const toggleSelectPhoto = (url) => {
        const isAdded = photosToShare.includes(url);
        updatePhotosToShare(url, !isAdded);
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

            <form className="mt-10 bg-gradient-to-r from-pink-300 via-teal-300 to-blue-300 shadow-md rounded-lg p-8" onSubmit={handleSubmit}>
                <div className="mb-6">
                    <FormField
                        labelName="Your Name"
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={form.name}
                        handleChange={handleChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="mb-6">
                    {isPromptEditing ? (
                    <input
                        labelName="Prompt"
                        type="text"
                        name="prompt"
                        value={tempPrompt}
                        onChange={(e) => setTempPrompt(e.target.value)}
                        onBlur={handlePromptBlur}
                        className="w-full p-2 border rounded"
                        placeholder="Describe what you want to see..."
                    />
                    ) : (
                        <button
                        type="button"
                        onClick={handlePromptClick}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 w-full text-left"
                        >
                        {form.prompt || 'Click here to enter a prompt'}
                        </button>
                    )}
                </div>


                <div className="flex justify-center mb-6">
                    <button
                        type="button"
                        onClick={generateImage}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-blue-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 mr-4"
                        disabled={generatingImg}
                    >
                        {generatingImg ? 'Generating...' : 'Generate Image'}
                    </button>

                    <button
                            type="button"
                            onClick={handleSurpriseMe}
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105 mr-4"
                        >
                            Surprise Me!
                        </button>

                    <button
                        type="button"
                        onClick={handleVoiceTyping}
                        className={`bg-gradient-to-r ${isListening ? 'from-red-500 to-red-700' : 'from-green-500 to-green-700'} hover:from-blue-500 hover:to-green-500 text-white font-bold py-2 px-4 rounded shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                        {isListening ? 'Stop Listening' : 'Voice Type'}
                    </button>
                </div>

                {form.photos.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                        {form.photos.map((photo, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={photo.url}
                                    alt={`Generated by ${form.name}`}
                                    className={`w-full h-64 object-cover rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer ${photosToShare.includes(photo.url) ? 'border-4 border-blue-500' : 'border-4 border-transparent'}`}
                                    onClick={() => toggleSelectPhoto(photo.url)}
                                />
                                <div className="absolute bottom-2 right-2 flex space-x-2">
                                    <button onClick={() => handleDownloadPhoto(photo.url)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
                                        <FaDownload />
                                    </button>
                                    <button onClick={() => handleSavePhoto(photo.url)} className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-110">
                                        <FaSave />
                                    </button>
                                    <button onClick={() => handleDeletePhoto(photo.url)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110">
                                        <FaTrashAlt />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading && <Loader />}
                {!loading && photosToShare.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-blue-500 hover:to-green-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Share {photosToShare.length} {photosToShare.length === 1 ? 'Image' : 'Images'} to Community
                        </button>
                    </div>
                )}
            </form>

            <div className="mt-12 text-center">
                <button
                    onClick={handleShowRecentCreations}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-orange-500 hover:to-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                    {showRecentCreations ? 'Hide Recent Creations' : 'Show Recent Creations'}
                </button>
            </div>

            {showRecentCreations && (
                <div className="mt-8 grid grid-cols-2 gap-4">
                    {recentImages.map((photo, index) => (
                        <div key={index} className="relative">
                            <img
                                src={photo.url}
                                alt={`Created by ${photo.name}`}
                                className={`w-full h-64 object-cover rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 cursor-pointer ${photosToShare.includes(photo.url) ? 'border-4 border-blue-500' : 'border-4 border-transparent'}`}
                                onClick={() => toggleSelectPhoto(photo.url)}
                            />
                            <div className="absolute bottom-2 right-2 flex space-x-2">
                                <button onClick={() => handleDownloadPhoto(photo.url)} className="bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-110">
                                    <FaDownload />
                                </button>
                                <button onClick={() => handleSavePhoto(photo.url)} className="bg-green-500 text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 transform hover:scale-110">
                                    <FaSave />
                                </button>
                                <button onClick={() => handleDeletePhoto(photo.url)} className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110">
                                    <FaTrashAlt />
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
