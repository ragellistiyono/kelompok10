import React, { useState, useEffect } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Button } from "./ui/button";
import { useTranslation } from "react-i18next";

interface UserProfileProps {
  initialName?: string;
  initialImage?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  initialName = "Isi Dengan Namamu", 
  initialImage = "/ellipse-4.png" 
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState(
    localStorage.getItem("userName") || initialName
  );
  const [imageUrl, setImageUrl] = useState(
    localStorage.getItem("userImage") || initialImage
  );
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Save to localStorage whenever these values change
    localStorage.setItem("userName", name);
    if (imageUrl !== initialImage) {
      localStorage.setItem("userImage", imageUrl);
    }
  }, [name, imageUrl, initialImage]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempName(e.target.value);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTempImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (tempName.trim()) {
      setName(tempName);
    }
    
    if (tempImageUrl) {
      setImageUrl(tempImageUrl);
    }
    
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempName(name);
    setTempImageUrl("");
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="flex items-center gap-4">
      {isEditing ? (
        <div className="bg-[#2f373e] p-4 rounded-lg w-64">
          <div className="flex flex-col items-center mb-4">
            <Avatar className="w-16 h-16 cursor-pointer mb-2" onClick={() => fileInputRef.current?.click()}>
              <AvatarImage src={tempImageUrl || imageUrl} alt={name} />
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('userProfile.changePhoto')}
            </Button>
          </div>
          <input
            type="text"
            value={tempName}
            onChange={handleNameChange}
            className="w-full bg-[#242b31] text-white px-3 py-2 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ff6f06] mb-4"
          />
          <div className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="bg-[#ff6f06] border-gray-600"
            >
              {t('userProfile.cancel')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              className="bg-[#ff6f06] hover:bg-[#e56300]"
            >
              {t('userProfile.save')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <Avatar className="cursor-pointer" onClick={() => setIsEditing(true)}>
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-white text-lg font-medium">{name}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-gray-400 p-0 h-auto"
              onClick={() => setIsEditing(true)}
            >
              {t('userProfile.editProfile')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}; 
