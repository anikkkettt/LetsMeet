

// import { useEffect, useRef, useState } from "react"
// import io from "socket.io-client"
// import Peer from "peerjs"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, LogOut, Users, X, Grid, Layout } from "lucide-react"

// const SERVER_URL = "http://localhost:8000"
// // Maximum number of remote video tiles to show when no one is presenting
// const MAX_VISIBLE_VIDEOS = 6

// export default function VideoMeetComponent() {
//   const [myId, setMyId] = useState("")
//   const [participants, setParticipants] = useState([])
//   const [messages, setMessages] = useState([])
//   const [inputMessage, setInputMessage] = useState("")
//   const [username, setUsername] = useState("")
//   const [roomId, setRoomId] = useState("")
//   const [isLobby, setIsLobby] = useState(true)
//   const [isMuted, setIsMuted] = useState(false)
//   const [isVideoOff, setIsVideoOff] = useState(false)
//   // When true, the local participant is sharing their screen.
//   const [isScreenSharing, setIsScreenSharing] = useState(false)
//   const [isChatOpen, setIsChatOpen] = useState(false)
//   const [isParticipantsOpen, setIsParticipantsOpen] = useState(false)
//   const [layout, setLayout] = useState("grid") // grid or spotlight

//   const socketRef = useRef()
//   const myVideoRef = useRef() // displays local video (webcam or screen share)
//   const localStreamRef = useRef(null) // current active stream (may be screen share)
//   const originalStreamRef = useRef(null) // original webcam stream
//   const peersRef = useRef({}) // holds the “main” calls
//   const webcamPeersRef = useRef({}) // holds the extra calls for the webcam stream
//   const peerRef = useRef(null) // to store the Peer instance

//   // ---------------------------
//   // UI LAYOUT HELPER FUNCTION
//   // ---------------------------
//   const updateVideoGridUI = () => {
//     const grid = document.getElementById("video-grid")
//     if (!grid) return

//     // Remove any existing "+others" tile
//     const existingOthers = grid.querySelector(".others-tile")
//     if (existingOthers) existingOthers.remove()

//     if (isScreenSharing) {
//       // Screen sharing mode
//       grid.className = "flex-1 p-4 flex flex-col relative"

//       // Show only screen share and presenter's webcam overlay
//       Array.from(grid.querySelectorAll("video")).forEach((video) => {
//         if (video.id === "local-video") {
//           // Main screen share
//           video.className = "w-full h-full object-contain rounded-lg"
//         } else if (video.id === `${myId}-webcam` || video.id === "presenter-webcam") {
//           // Presenter's webcam overlay
//           video.className = "absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
//         } else {
//           // Other videos (if any)
//           video.style.display = "none"
//         }
//       })
//     } else {
//       // Normal mode: 2x3 grid
//       grid.className = `flex-1 gap-4 p-4 overflow-scroll ${
//         layout === "grid"
//           ? "grid grid-cols-2 md:grid-cols-3 grid-rows-2 auto-rows-fr"
//           : "flex justify-start items-stretch"
//       }`

//       const remoteVideos = Array.from(grid.querySelectorAll("video")).filter((v) => v.id !== "local-video")

//       // Show first 5 remote videos (6 total with local)
//       remoteVideos.forEach((video, index) => {
//         video.className = "w-full h-full object-cover rounded-lg"
//         if (index < MAX_VISIBLE_VIDEOS - 1) {
//           video.style.display = "block"
//         } else {
//           video.style.display = "none"
//         }
//       })

//       // If there are more hidden videos, show the "+others" tile
//       if (remoteVideos.length > MAX_VISIBLE_VIDEOS - 1) {
//         const extraCount = remoteVideos.length - (MAX_VISIBLE_VIDEOS - 1)
//         const othersTile = document.createElement("div")
//         othersTile.className = "others-tile flex items-center justify-center bg-gray-700 rounded-lg h-full"
//         othersTile.innerHTML = `
//           <div class="text-center">
//             <span class="text-white text-2xl font-semibold">+${extraCount}</span>
//             <p class="text-gray-300 text-sm mt-1">others</p>
//           </div>
//         `
//         grid.appendChild(othersTile)
//       }
//     }
//   }

//   // ---------------------------
//   // SETUP PEER & LOCAL MEDIA
//   // ---------------------------
//   useEffect(() => {
//     if (!isLobby) {
//       navigator.mediaDevices
//         .getUserMedia({ video: true, audio: true })
//         .then((stream) => {
//           // Save both as active stream and original webcam stream.
//           localStreamRef.current = stream
//           originalStreamRef.current = stream

//           // Set up the local video element.
//           myVideoRef.current.srcObject = stream
//           myVideoRef.current.muted = true

//           // Initialize Peer and store it in peerRef.
//           const peer = new Peer()
//           peerRef.current = peer

//           peer.on("open", (id) => {
//             setMyId(id)
//             socketRef.current = io(SERVER_URL)
//             socketRef.current.emit("join-room", roomId, id)

//             socketRef.current.on("user-connected", (userId) => {
//               connectToNewUser(userId, stream)
//             })

//             socketRef.current.on("user-disconnected", (userId) => {
//               // Close both main and webcam calls if they exist.
//               if (peersRef.current[userId]) {
//                 peersRef.current[userId].close()
//                 delete peersRef.current[userId]
//               }
//               if (webcamPeersRef.current[userId]) {
//                 webcamPeersRef.current[userId].close()
//                 delete webcamPeersRef.current[userId]
//               }
//               const videoEl = document.getElementById(userId)
//               if (videoEl) videoEl.remove()
//               const webcamEl = document.getElementById(`${userId}-webcam`)
//               if (webcamEl) webcamEl.remove()
//               updateVideoGridUI()
//             })

//             socketRef.current.on("participants-updated", (users) => {
//               setParticipants(users)
//             })

//             socketRef.current.on("message", (message, sender) => {
//               setMessages((prev) => [...prev, { sender, message }])
//             })
//           })

//           // Answer incoming calls.
//           peer.on("call", (call) => {
//             // Determine the stream type from metadata.
//             const streamType = call.metadata?.streamType || "default"
//             // Answer with local stream (or you can answer with nothing if desired).
//             call.answer(stream)
//             const video = document.createElement("video")
//             // If this is the extra webcam call, give it a unique id.
//             if (streamType === "webcam") {
//               video.id = `${call.peer}-webcam`
//             } else {
//               video.id = call.peer // for normal calls (screen share or webcam when not sharing)
//             }
//             addVideoStream(video, call)
//           })

//           // Function to connect to a new user.
//           const connectToNewUser = (userId, stream) => {
//             // Call the new user with the current active stream.
//             const call = peer.call(userId, stream)
//             const video = document.createElement("video")
//             video.id = userId
//             addVideoStream(video, call)
//             call.on("close", () => {
//               video.remove()
//               updateVideoGridUI()
//             })
//             peersRef.current[userId] = call

//             // If we are screen sharing, also send the original webcam stream.
//             if (isScreenSharing && originalStreamRef.current) {
//               const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0]
//               const webcamStream = new MediaStream([originalVideoTrack])
//               const webcamCall = peer.call(userId, webcamStream, {
//                 metadata: { streamType: "webcam" },
//               })
//               const webcamVideo = document.createElement("video")
//               webcamVideo.id = `${userId}-webcam`
//               addVideoStream(webcamVideo, webcamCall)
//               webcamCall.on("close", () => {
//                 webcamVideo.remove()
//                 updateVideoGridUI()
//               })
//               webcamPeersRef.current[userId] = webcamCall
//             }
//           }
//         })
//         .catch((err) => console.error("Error accessing media devices:", err))
//     }
//   }, [isLobby, roomId])

//   // ---------------------------
//   // ADD REMOTE VIDEO USING OLD METHOD
//   // ---------------------------
//   const addVideoStream = (video, call) => {
//     call.on("stream", (userVideoStream) => {
//       video.srcObject = userVideoStream
//       video.addEventListener("loadedmetadata", () => {
//         video.play()
//       })
//       video.classList.add("w-full", "h-full", "object-cover", "rounded-lg")
//       const videoGrid = document.getElementById("video-grid")
//       if (videoGrid) {
//         videoGrid.appendChild(video)
//       }
//       // For non-local videos, ensure audio is not muted.
//       if (userVideoStream !== localStreamRef.current) {
//         video.muted = false
//       }
//       updateVideoGridUI()
//     })
//   }

//   const handleJoinRoom = () => {
//     if (username && roomId) {
//       setIsLobby(false)
//     }
//   }

//   // ---------------------------
//   // TOGGLE AUDIO / VIDEO
//   // ---------------------------
//   const toggleAudio = () => {
//     if (localStreamRef.current) {
//       const audioTrack = localStreamRef.current.getAudioTracks()[0]
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled
//         setIsMuted(!audioTrack.enabled)
//       }
//     }
//   }

//   const toggleVideo = () => {
//     if (localStreamRef.current) {
//       const videoTrack = localStreamRef.current.getVideoTracks()[0]
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled
//         setIsVideoOff(!videoTrack.enabled)
//       }
//     }
//   }

//   // ---------------------------
//   // SCREEN SHARE LOGIC
//   // ---------------------------
//   const toggleScreenShare = async () => {
//     if (!isScreenSharing) {
//       try {
//         const screenStream = await navigator.mediaDevices.getDisplayMedia({
//           video: true,
//         })
//         const screenTrack = screenStream.getVideoTracks()[0]

//         // Replace video track for all main peer connections.
//         Object.values(peersRef.current).forEach((call) => {
//           const sender = call.peerConnection
//             .getSenders()
//             .find((s) => s.track && s.track.kind === "video")
//           if (sender) {
//             sender.replaceTrack(screenTrack)
//           }
//         })

//         // Store the original video track
//         const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0]

//         // Replace the local video track:
//         if (localStreamRef.current) {
//           localStreamRef.current.removeTrack(originalVideoTrack)
//           localStreamRef.current.addTrack(screenTrack)
//         }
//         myVideoRef.current.srcObject = localStreamRef.current
//         setIsScreenSharing(true)

//         // Create the presenter webcam call for existing peers.
//         Object.keys(peersRef.current).forEach((userId) => {
//           if (originalStreamRef.current) {
//             const webcamStream = new MediaStream([originalVideoTrack])
//             const webcamCall = peerRef.current.call(userId, webcamStream, {
//               metadata: { streamType: "webcam" },
//             })
//             // Create a separate video element for this call on the local DOM if desired.
//             // (Remote clients will handle their own rendering.)
//             webcamCall.on("stream", (userVideoStream) => {
//               // Optionally, you can display a local preview of your webcam.
//               // For example, if you want a small tile showing your webcam while sharing.
//               let existing = document.getElementById("presenter-webcam")
//               if (!existing) {
//                 const video = document.createElement("video")
//                 video.id = "presenter-webcam"
//                 video.className =
//                   "absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
//                 video.srcObject = new MediaStream([originalVideoTrack])
//                 video.muted = true
//                 video.addEventListener("loadedmetadata", () => {
//                   video.play()
//                 })
//                 const grid = document.getElementById("video-grid")
//                 if (grid) grid.appendChild(video)
//               }
//             })
//             webcamPeersRef.current[userId] = webcamCall
//           }
//         })

//         updateVideoGridUI()

//         // When screen sharing stops, revert.
//         screenTrack.onended = () => {
//           stopScreenShare(originalVideoTrack)
//         }
//       } catch (err) {
//         console.error("Error sharing screen:", err)
//       }
//     } else {
//       stopScreenShare()
//     }
//   }

//   const stopScreenShare = async (originalVideoTrack) => {
//     try {
//       let webcamTrack = originalVideoTrack

//       if (!webcamTrack) {
//         const webcamStream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//         })
//         webcamTrack = webcamStream.getVideoTracks()[0]
//       }

//       // Revert the video track in all main connections.
//       Object.values(peersRef.current).forEach((call) => {
//         const sender = call.peerConnection
//           .getSenders()
//           .find((s) => s.track && s.track.kind === "video")
//         if (sender) {
//           sender.replaceTrack(webcamTrack)
//         }
//       })

//       // Close all extra webcam calls.
//       Object.values(webcamPeersRef.current).forEach((call) => {
//         call.close()
//       })
//       webcamPeersRef.current = {}

//       if (localStreamRef.current) {
//         localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0])
//         localStreamRef.current.addTrack(webcamTrack)
//       }
//       myVideoRef.current.srcObject = localStreamRef.current
//       setIsScreenSharing(false)

//       // Remove the local presenter webcam tile.
//       const webcamTile = document.getElementById("presenter-webcam")
//       if (webcamTile) webcamTile.remove()

//       updateVideoGridUI()
//     } catch (err) {
//       console.error("Error stopping screen share:", err)
//     }
//   }

//   const sendMessage = () => {
//     if (inputMessage.trim() !== "") {
//       socketRef.current.emit("message", roomId, inputMessage, username)
//       setInputMessage("")
//     }
//   }

//   // ---------------------------
//   // RENDERING
//   // ---------------------------
//   if (isLobby) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
//         <Card className="w-full max-w-md">
//           <CardContent className="pt-8 pb-6">
//             <div className="text-center mb-8">
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Meeting</h1>
//               <p className="text-gray-500">Enter your details to join the video conference</p>
//             </div>
//             <div className="space-y-4">
//               <Input
//                 type="text"
//                 placeholder="Your Name"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 className="h-12"
//               />
//               <Input
//                 type="text"
//                 placeholder="Room ID"
//                 value={roomId}
//                 onChange={(e) => setRoomId(e.target.value)}
//                 className="h-12"
//               />
//               <Button
//                 onClick={handleJoinRoom}
//                 className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
//                 disabled={!username || !roomId}
//               >
//                 Join Meeting
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="h-screen bg-gray-900 flex overflow-hidden">
//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Video Grid Container */}
//         <div
//           id="video-grid"
//           className={`flex-1 gap-4 p-4 overflow-scroll ${
//             layout === "grid"
//               ? "grid grid-cols-2 md:grid-cols-3 grid-rows-2 auto-rows-fr"
//               : "flex justify-start items-stretch"
//           }`}
//         >
//           {/* Local video element (shows either webcam or screen share) */}
//           <video
//             id="local-video"
//             ref={myVideoRef}
//             autoPlay
//             playsInline
//             className={`rounded-lg object-cover ${layout === "grid" ? "w-full h-full" : "max-h-[80vh] max-w-[90vw]"}`}
//           />
//           {/* Remote videos are appended dynamically via addVideoStream */}
//         </div>

//         {/* Control Bar */}
//         <div className="bg-gray-800 p-6 flex items-center justify-between">
//           <div className="flex items-center space-x-2">
//             <span className="text-red-500 animate-pulse">●</span>
//             <span className="text-white">{roomId}</span>
//           </div>

//           <div className="flex space-x-4">
//             <Button
//               variant={isMuted ? "destructive" : "secondary"}
//               size="lg"
//               className="rounded-full h-12 w-12"
//               onClick={toggleAudio}
//             >
//               {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
//             </Button>
//             <Button
//               variant={isVideoOff ? "destructive" : "secondary"}
//               size="lg"
//               className="rounded-full h-12 w-12"
//               onClick={toggleVideo}
//             >
//               {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
//             </Button>
//             <Button
//               variant={isScreenSharing ? "destructive" : "secondary"}
//               size="lg"
//               className="rounded-full h-12 w-12"
//               onClick={toggleScreenShare}
//             >
//               <Monitor className="h-5 w-5" />
//             </Button>
//             <Button
//               variant="secondary"
//               size="lg"
//               className="rounded-full h-12 w-12"
//               onClick={() => setLayout(layout === "grid" ? "spotlight" : "grid")}
//             >
//               {layout === "grid" ? <Grid className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
//             </Button>
//           </div>

//           <div className="flex space-x-4">
//             <Button
//               variant="secondary"
//               size="lg"
//               className={`rounded-full h-12 w-12 ${isParticipantsOpen ? "bg-gray-700" : ""}`}
//               onClick={() => {
//                 setIsParticipantsOpen(!isParticipantsOpen)
//                 setIsChatOpen(false)
//               }}
//             >
//               <Users className="h-5 w-5" />
//             </Button>
//             <Button
//               variant="secondary"
//               size="lg"
//               className={`rounded-full h-12 w-12 ${isChatOpen ? "bg-gray-700" : ""}`}
//               onClick={() => {
//                 setIsChatOpen(!isChatOpen)
//                 setIsParticipantsOpen(false)
//               }}
//             >
//               <MessageSquare className="h-5 w-5" />
//             </Button>
//             <Button
//               variant="destructive"
//               size="lg"
//               className="rounded-full h-12 w-12"
//               onClick={() => window.location.reload()}
//             >
//               <LogOut className="h-5 w-5" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       {/* Sidebar for Chat/Participants */}
//       {(isChatOpen || isParticipantsOpen) && (
//         <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
//           <div className="p-4 border-b border-gray-700 flex justify-between items-center">
//             <h2 className="text-xl font-semibold text-white">{isChatOpen ? "Chat" : "Participants"}</h2>
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => {
//                 setIsChatOpen(false)
//                 setIsParticipantsOpen(false)
//               }}
//             >
//               <X className="h-5 w-5" />
//             </Button>
//           </div>

//           {isParticipantsOpen && (
//             <ScrollArea className="flex-1 p-4">
//               <div className="space-y-2">
//                 {participants.map((participant, index) => (
//                   <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
//                     <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
//                       <span className="text-white text-sm">
//                         {(participant === myId ? username : participant).charAt(0).toUpperCase()}
//                       </span>
//                     </div>
//                     <span className="text-white">
//                       {participant === myId ? `${username} (You)` : participant}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </ScrollArea>
//           )}

//           {isChatOpen && (
//             <div className="flex flex-col h-full">
//               <ScrollArea className="flex-1 p-4">
//                 <div className="space-y-4">
//                   {messages.map((msg, index) => (
//                     <div
//                       key={index}
//                       className={`flex flex-col ${msg.sender === username ? "items-end" : "items-start"}`}
//                     >
//                       <div className="flex flex-col space-y-1">
//                         <span className="text-sm text-gray-400">{msg.sender}</span>
//                         <div
//                           className={`rounded-lg px-4 py-2 max-w-[80%] ${
//                             msg.sender === username ? "bg-indigo-600 text-white" : "bg-gray-700 text-white"
//                           }`}
//                         >
//                           {msg.message}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </ScrollArea>

//               <div className="p-4 border-t border-gray-700">
//                 <div className="flex space-x-2">
//                   <Input
//                     type="text"
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     placeholder="Type a message..."
//                     className="flex-1 bg-gray-700 border-gray-600 text-white"
//                     onKeyPress={(e) => e.key === "Enter" && sendMessage()}
//                   />
//                   <Button onClick={sendMessage}>
//                     <MessageSquare className="h-4 w-4" />
//                   </Button>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }




import { useEffect, useRef, useState } from "react"
import io from "socket.io-client"
import Peer from "peerjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Mic, MicOff, Video, VideoOff, Monitor, MessageSquare, LogOut, Users, X, Grid, Layout } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Server ka URL jahan pe hamara backend chal raha hai
const SERVER_URL = "https://letsmeet-wloh.onrender.com"
// Jab koi screen share nahi kar raha, tab maximum kitne videos dikhenge
const MAX_VISIBLE_VIDEOS = 6

export default function VideoMeetComponent() {
  // Basic states jo UI aur functionality ke liye zaruri hain
  const [myId, setMyId] = useState("") // Mera unique ID
  const [participants, setParticipants] = useState([]) // Meeting mein jo log hain
  const [messages, setMessages] = useState([]) // Chat messages
  const [inputMessage, setInputMessage] = useState("") // Input field ka message
  const [username, setUsername] = useState("") // User ka naam
  const [roomId, setRoomId] = useState("") // Meeting ka unique ID
  const [isLobby, setIsLobby] = useState(true) // Kya user lobby mein hai ya meeting mein
  const [isMuted, setIsMuted] = useState(false) // Kya mic muted hai
  const [isVideoOff, setIsVideoOff] = useState(false) // Kya video off hai
  const [isScreenSharing, setIsScreenSharing] = useState(false) // Kya screen share ho raha hai
  const [isChatOpen, setIsChatOpen] = useState(false) // Kya chat window open hai
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false) // Kya participants list open hai
  const [layout, setLayout] = useState("grid") // Video layout - grid ya spotlight

  const navigate = useNavigate()

  // Refs jo DOM elements aur streams ko track karte hain
  const socketRef = useRef() // Socket connection ka reference
  const myVideoRef = useRef() // Mera video element ka reference
  const localStreamRef = useRef(null) // Current active stream (webcam ya screen share)
  const originalStreamRef = useRef(null) // Original webcam stream
  const peersRef = useRef({}) // Main peer connections ka object
  const webcamPeersRef = useRef({}) // Extra webcam streams ke liye peer connections
  const peerRef = useRef(null) // Peer instance ka reference

  // UI Layout helper function jo video grid ko update karta hai
  const updateVideoGridUI = () => {
    const grid = document.getElementById("video-grid")
    if (!grid) return

    // Remove any existing "+others" tile
    const existingOthers = grid.querySelector(".others-tile")
    if (existingOthers) existingOthers.remove()

    if (isScreenSharing) {
      // Screen sharing mode
      grid.className = "flex-1 p-4 flex flex-col relative"

      // Show only screen share and presenter's webcam overlay
      Array.from(grid.querySelectorAll("video")).forEach((video) => {
        if (video.id === "local-video") {
          // Main screen share
          video.className = "w-full h-full object-contain rounded-lg"
        } else if (video.id === `${myId}-webcam` || video.id === "presenter-webcam") {
          // Presenter's webcam overlay
          video.className = "absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
        } else {
          // Other videos (if any)
          video.style.display = "none"
        }
      })
    } else {
      // Normal mode: 2x3 grid
      grid.className = `flex-1 gap-4 p-4 overflow-scroll ${
        layout === "grid"
          ? "grid grid-cols-2 md:grid-cols-3 grid-rows-2 auto-rows-fr"
          : "flex justify-start items-stretch"
      }`

      const remoteVideos = Array.from(grid.querySelectorAll("video")).filter((v) => v.id !== "local-video")

      // Show first 5 remote videos (6 total with local)
      remoteVideos.forEach((video, index) => {
        video.className = "w-full h-full object-cover rounded-lg"
        if (index < MAX_VISIBLE_VIDEOS - 1) {
          video.style.display = "block"
        } else {
          video.style.display = "none"
        }
      })

      // If there are more hidden videos, show the "+others" tile
      if (remoteVideos.length > MAX_VISIBLE_VIDEOS - 1) {
        const extraCount = remoteVideos.length - (MAX_VISIBLE_VIDEOS - 1)
        const othersTile = document.createElement("div")
        othersTile.className = "others-tile flex items-center justify-center bg-gray-700 rounded-lg h-full"
        othersTile.innerHTML = `
          <div class="text-center">
            <span class="text-white text-2xl font-semibold">+${extraCount}</span>
            <p class="text-gray-300 text-sm mt-1">others</p>
          </div>
        `
        grid.appendChild(othersTile)
      }
    }
  }

  // Jab user lobby se meeting mein join karta hai
  useEffect(() => {
    if (!isLobby) {
      // User se camera aur mic access maangne ka code
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          // Save both as active stream and original webcam stream.
          localStreamRef.current = stream
          originalStreamRef.current = stream

          // Set up the local video element.
          myVideoRef.current.srcObject = stream
          myVideoRef.current.muted = true

          // Initialize Peer and store it in peerRef.
          const peer = new Peer()
          peerRef.current = peer

          peer.on("open", (id) => {
            setMyId(id)
            socketRef.current = io(SERVER_URL)
            socketRef.current.emit("join-room", roomId, id)

            socketRef.current.on("user-connected", (userId) => {
              connectToNewUser(userId, stream)
            })

            socketRef.current.on("user-disconnected", (userId) => {
              // Close both main and webcam calls if they exist.
              if (peersRef.current[userId]) {
                peersRef.current[userId].close()
                delete peersRef.current[userId]
              }
              if (webcamPeersRef.current[userId]) {
                webcamPeersRef.current[userId].close()
                delete webcamPeersRef.current[userId]
              }
              const videoEl = document.getElementById(userId)
              if (videoEl) videoEl.remove()
              const webcamEl = document.getElementById(`${userId}-webcam`)
              if (webcamEl) webcamEl.remove()
              updateVideoGridUI()
            })

            socketRef.current.on("participants-updated", (users) => {
              setParticipants(users)
            })

            socketRef.current.on("message", (message, sender) => {
              setMessages((prev) => [...prev, { sender, message }])
            })
          })

          // Answer incoming calls.
          peer.on("call", (call) => {
            // Determine the stream type from metadata.
            const streamType = call.metadata?.streamType || "default"
            // Answer with local stream (or you can answer with nothing if desired).
            call.answer(stream)
            const video = document.createElement("video")
            // If this is the extra webcam call, give it a unique id.
            if (streamType === "webcam") {
              video.id = `${call.peer}-webcam`
            } else {
              video.id = call.peer // for normal calls (screen share or webcam when not sharing)
            }
            addVideoStream(video, call)
          })

          // Function to connect to a new user.
          const connectToNewUser = (userId, stream) => {
            // Call the new user with the current active stream.
            const call = peer.call(userId, stream)
            const video = document.createElement("video")
            video.id = userId
            addVideoStream(video, call)
            call.on("close", () => {
              video.remove()
              updateVideoGridUI()
            })
            peersRef.current[userId] = call

            // If we are screen sharing, also send the original webcam stream.
            if (isScreenSharing && originalStreamRef.current) {
              const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0]
              const webcamStream = new MediaStream([originalVideoTrack])
              const webcamCall = peer.call(userId, webcamStream, {
                metadata: { streamType: "webcam" },
              })
              const webcamVideo = document.createElement("video")
              webcamVideo.id = `${userId}-webcam`
              addVideoStream(webcamVideo, webcamCall)
              webcamCall.on("close", () => {
                webcamVideo.remove()
                updateVideoGridUI()
              })
              webcamPeersRef.current[userId] = webcamCall
            }
          }
        })
        .catch((err) => console.error("Error accessing media devices:", err))
    }
  }, [isLobby, roomId])

  // Remote video ko add karne ka function
  const addVideoStream = (video, call) => {
    call.on("stream", (userVideoStream) => {
      video.srcObject = userVideoStream
      video.addEventListener("loadedmetadata", () => {
        video.play()
      })
      video.classList.add("w-full", "h-full", "object-cover", "rounded-lg")
      const videoGrid = document.getElementById("video-grid")
      if (videoGrid) {
        videoGrid.appendChild(video)
      }
      // For non-local videos, ensure audio is not muted.
      if (userVideoStream !== localStreamRef.current) {
        video.muted = false
      }
      updateVideoGridUI()
    })
  }

  // Room join karne ka handler
  const handleJoinRoom = () => {
    if (username && roomId) {
      setIsLobby(false)
    }
  }

  // Audio toggle karne ka function
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsMuted(!audioTrack.enabled)
      }
    }
  }

  // Video toggle karne ka function
  const toggleVideo = () => {
    if (originalStreamRef.current) {
      const videoTrack = originalStreamRef.current.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoOff(!videoTrack.enabled)

        // Update the webcam video for all peers
        Object.values(webcamPeersRef.current).forEach((call) => {
          const sender = call.peerConnection.getSenders().find((s) => s.track && s.track.kind === "video")
          if (sender) {
            sender.track.enabled = videoTrack.enabled
          }
        })

        // Update local webcam preview if it exists
        const localWebcamPreview = document.getElementById("presenter-webcam")
        if (localWebcamPreview) {
          localWebcamPreview.srcObject.getVideoTracks()[0].enabled = videoTrack.enabled
        }
      }
    }
  }

  // Screen share toggle karne ka function
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        })
        const screenTrack = screenStream.getVideoTracks()[0]

        // Replace video track for all main peer connections.
        Object.values(peersRef.current).forEach((call) => {
          const sender = call.peerConnection.getSenders().find((s) => s.track && s.track.kind === "video")
          if (sender) {
            sender.replaceTrack(screenTrack)
          }
        })

        // Store the original video track
        const originalVideoTrack = originalStreamRef.current.getVideoTracks()[0]

        // Replace the local video track:
        if (localStreamRef.current) {
          localStreamRef.current.removeTrack(originalVideoTrack)
          localStreamRef.current.addTrack(screenTrack)
        }
        myVideoRef.current.srcObject = localStreamRef.current
        setIsScreenSharing(true)

        // Create the presenter webcam call for existing peers.
        Object.keys(peersRef.current).forEach((userId) => {
          if (originalStreamRef.current) {
            const webcamStream = new MediaStream([originalVideoTrack])
            const webcamCall = peerRef.current.call(userId, webcamStream, {
              metadata: { streamType: "webcam" },
            })
            // Create a separate video element for this call on the local DOM if desired.
            // (Remote clients will handle their own rendering.)
            webcamCall.on("stream", (userVideoStream) => {
              // Optionally, you can display a local preview of your webcam.
              // For example, if you want a small tile showing your webcam while sharing.
              const existing = document.getElementById("presenter-webcam")
              if (!existing) {
                const video = document.createElement("video")
                video.id = "presenter-webcam"
                video.className =
                  "absolute top-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white shadow-lg"
                video.srcObject = new MediaStream([originalVideoTrack])
                video.muted = true
                video.addEventListener("loadedmetadata", () => {
                  video.play()
                })
                const grid = document.getElementById("video-grid")
                if (grid) grid.appendChild(video)
              }
            })
            webcamPeersRef.current[userId] = webcamCall
          }
        })

        updateVideoGridUI()

        // When screen sharing stops, revert.
        screenTrack.onended = () => {
          stopScreenShare(originalVideoTrack)
        }
      } catch (err) {
        console.error("Error sharing screen:", err)
      }
    } else {
      stopScreenShare()
    }
  }

  // Screen share band karne ka function
  const stopScreenShare = async (originalVideoTrack) => {
    try {
      let webcamTrack = originalVideoTrack

      if (!webcamTrack) {
        const webcamStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        webcamTrack = webcamStream.getVideoTracks()[0]
      }

      // Revert the video track in all main connections.
      Object.values(peersRef.current).forEach((call) => {
        const sender = call.peerConnection.getSenders().find((s) => s.track && s.track.kind === "video")
        if (sender) {
          sender.replaceTrack(webcamTrack)
        }
      })

      // Close all extra webcam calls.
      Object.values(webcamPeersRef.current).forEach((call) => {
        call.close()
      })
      webcamPeersRef.current = {}

      if (localStreamRef.current) {
        localStreamRef.current.removeTrack(localStreamRef.current.getVideoTracks()[0])
        localStreamRef.current.addTrack(webcamTrack)
      }
      myVideoRef.current.srcObject = localStreamRef.current
      setIsScreenSharing(false)

      // Remove the local presenter webcam tile.
      const webcamTile = document.getElementById("presenter-webcam")
      if (webcamTile) webcamTile.remove()

      updateVideoGridUI()
    } catch (err) {
      console.error("Error stopping screen share:", err)
    }
  }

  // Chat message bhejne ka function
  const sendMessage = () => {
    if (inputMessage.trim() !== "") {
      socketRef.current.emit("message", roomId, inputMessage, username)
      setInputMessage("")
    }
  }

  // Lobby UI render karne ka code
  if (isLobby) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Meeting</h1>
              <p className="text-gray-500">Enter your details to join the video conference</p>
            </div>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Your Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12"
              />
              <Input
                type="text"
                placeholder="Room ID"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="h-12"
              />
              <Button
                onClick={handleJoinRoom}
                className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700"
                disabled={!username || !roomId}
              >
                Join Meeting
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main meeting UI render karne ka code
  return (
    <div className="h-screen bg-gray-900 flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Video Grid Container */}
        <div
          id="video-grid"
          className={`flex-1 gap-4 p-4 overflow-scroll ${
            layout === "grid"
              ? "grid grid-cols-2 md:grid-cols-3 grid-rows-2 auto-rows-fr"
              : "flex justify-start items-stretch"
          }`}
        >
          {/* Local video element (shows either webcam or screen share) */}
          <video
            id="local-video"
            ref={myVideoRef}
            autoPlay
            playsInline
            className={`rounded-lg object-cover ${layout === "grid" ? "w-full h-full" : "max-h-[80vh] max-w-[90vw]"}`}
          />
          {/* Remote videos are appended dynamically via addVideoStream */}
        </div>

        {/* Control Bar */}
        <div className="bg-gray-800 p-6 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-red-500 animate-pulse">●</span>
            <span className="text-white">{roomId}</span>
          </div>

          <div className="flex space-x-4">
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12"
              onClick={toggleAudio}
            >
              {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <Button
              variant={isVideoOff ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12"
              onClick={toggleVideo}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </Button>
            <Button
              variant={isScreenSharing ? "destructive" : "secondary"}
              size="lg"
              className="rounded-full h-12 w-12"
              onClick={toggleScreenShare}
            >
              <Monitor className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="rounded-full h-12 w-12"
              onClick={() => setLayout(layout === "grid" ? "spotlight" : "grid")}
            >
              {layout === "grid" ? <Grid className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
            </Button>
          </div>

          <div className="flex space-x-4">
            <Button
              variant="secondary"
              size="lg"
              className={`rounded-full h-12 w-12 ${isParticipantsOpen ? "bg-gray-700" : ""}`}
              onClick={() => {
                setIsParticipantsOpen(!isParticipantsOpen)
                setIsChatOpen(false)
              }}
            >
              <Users className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className={`rounded-full h-12 w-12 ${isChatOpen ? "bg-gray-700" : ""}`}
              onClick={() => {
                setIsChatOpen(!isChatOpen)
                setIsParticipantsOpen(false)
              }}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="rounded-full h-12 w-12"
              onClick={() => {window.location.reload();
                navigate('/');
              }}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar for Chat/Participants */}
      {(isChatOpen || isParticipantsOpen) && (
        <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">{isChatOpen ? "Chat" : "Participants"}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsChatOpen(false)
                setIsParticipantsOpen(false)
              }}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {isParticipantsOpen && (
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-2">
                {participants.map((participant, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {(participant === myId ? username : participant).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-white">{participant === myId ? `${username} (You)` : participant}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {isChatOpen && (
            <div className="flex flex-col h-full">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex flex-col ${msg.sender === username ? "items-end" : "items-start"}`}
                    >
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-gray-400">{msg.sender}</span>
                        <div
                          className={`rounded-lg px-4 py-2 max-w-[80%] ${
                            msg.sender === username ? "bg-indigo-600 text-white" : "bg-gray-700 text-white"
                          }`}
                        >
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-700 border-gray-600 text-white"
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  />
                  <Button onClick={sendMessage}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

