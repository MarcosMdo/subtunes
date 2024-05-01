'use client'
import { useEffect, useState } from "react";

import styles from "./Component.module.css"

import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { motion, AnimatePresence } from 'framer-motion';
import { tune } from "../subtuneTypes/Tune";

import { HexColorPicker, HexColorInput } from "react-colorful";



export default function SubtuneForm({onColorChange, onImageChange, subtuneTunes}:{ onColorChange: (color: number[]) => void; onImageChange: (imageurl: string )=> void; subtuneTunes: tune[]}) {
    const [file, setFile] = useState<any>(null);
    const [image, setImage] = useState<string | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [compColor, setCompColor] = useState<string>("#000000");
    const [subtuneColorRGBA, setSubtuneColorRGBA] = useState<number[]>([0, 0, 0, 0]);
    const [subtuneData, setSubtuneData] = useState<{
        title: string;
        description: string;
        subtuneColor: string;
        subtuneImage: File | null;
        subtuneTuneIds: string[];
    }>({
        title: "",
        description: "",
        subtuneColor: "",
        subtuneImage: null,
        subtuneTuneIds: [],
    });

    // color picker
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    // color picker
    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const popoverId = open ? 'colorPickerPopover' : undefined;

    const findComplementaryColor = (subtuneColor: string) => {
        const rgb: number[] | undefined = subtuneData.subtuneColor.match(/\w\w/g)?.map(x => parseInt(x, 16)) as number[];
        console.log("subtune color rgb: ", rgb)
        rgb && setSubtuneColorRGBA([...rgb, 0.5]);
        onColorChange(subtuneColorRGBA);
        const complementaryRgb = rgb?.map(x => 255 - x); // complementary color in rgb
        const complementaryColor = `#${complementaryRgb?.map(x => x.toString(16).padStart(2, '0')).join('')}`; // complementary color in hex
        setCompColor(complementaryColor);
    };

    const handleColorChange = (color: string) => {
        findComplementaryColor(color);
        // console.log("color: ", color, "compColor: ", compColor);
        // setAngle((angle) => angle + 5 % 360);
        setSubtuneData({ ...subtuneData, subtuneColor: color });
    }

    // image uploader
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // checks 
        if (!e.target.files) return console.log("No files selected");
        setFile(e.target.files[0])
        setSubtuneData({...subtuneData, subtuneImage: e.target.files[0]})
    }
    useEffect(() => {
        const reader = new FileReader();
        
        // we first read the contents of the file and store it in the file reader object
        if (file){
            reader.readAsDataURL(file);
            setSubtuneData({...subtuneData, subtuneImage: file})
        }

        // then we store it in state var
        reader.onload = () => {
            setImage(reader.result as string);
            onImageChange(reader.result as string);
        }
    }, [file]);

    const VisuallyHiddenInput = styled('input')({
        clip: 'rect(0 0 0 0)',
        clipPath: 'inset(50%)',
        height: 1,
        overflow: 'hidden',
        position: 'absolute',
        bottom: 0,
        left: 0,
        whiteSpace: 'nowrap',
        width: 1,
    });

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // prolly wanna have this
        console.log("children: ", subtuneTunes);
        console.log("event", event);

        // remove the prepended unique id from the spotify id
        subtuneData.subtuneTuneIds = subtuneTunes.map(tune => tune.id.split('.')[1]);
        console.log("subtuneData: ", subtuneData);
        const data = {
            "name": subtuneData.title,
            "description": subtuneData.description,
            "tunes": subtuneData.subtuneTuneIds,
            "color": subtuneData.subtuneColor,
            "image": subtuneData.subtuneImage
        };


        const formData = new FormData();
        formData.append("data", JSON.stringify(data));
        subtuneData.subtuneImage && formData.append("image", subtuneData.subtuneImage);

        try {
            const response = await fetch('/api/subtune', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create subtune');
            }

            const responseData = await response.json();
            console.log('Subtune created successfully:', responseData);
            // Handle any further logic after creating the subtune
        } catch (error) {
            console.error('Error creating subtune:', error);
            // Handle error scenarios
        }
    };

    return (
        <div className="flex grow shrink h-1/4">
            <form
                onSubmit={handleSubmit} 
                className="flex flex-col grow shrink w-full h-full p-4 content-center justify-center"
            >
                {/* {
                    image ?
                    <img src={image} alt="subtuneImage" 
                    style={{width: "80px", border: "2px solid white", borderRadius: "5px"}} 
                    className="self-end"
                    /> : null
                } */}
                <div className="flex flex-col w-full h-full content-center justify-center">
                    <input 
                        required
                        type="text" 
                        name="subtune-name" 
                        id="subtune-name" 
                        placeholder="Subtune Name" 
                        onChange={(e) => setSubtuneData({...subtuneData, title: e.target.value})}
                        className="text-7xl w-full text-center self-center p-2 bg-transparent placeholder:text-center placeholder:text-gray-50 focus:outline-none"
                    />
                    <input 
                        required
                        type="text" 
                        name="subtune-description" 
                        id="subtune-description" 
                        placeholder="Subtune Description"
                        onChange={(e) => setSubtuneData({...subtuneData, description: e.target.value})} 
                        className="text-3xl text-center self-center bg-transparent placeholder:text-center placeholder:text-gray-50  focus:outline-none w-full p-2"
                    />
                    <div className="flex flex-row justify-center content-center">
                        <Button type="submit" color="primary" ><SaveRoundedIcon /></Button>
                        <Button type="button" color="primary" ><DeleteOutlineRoundedIcon /></Button>
                        <Button aria-describedby={popoverId} color="primary" onClick={handleClick} >
                            <ColorLensRoundedIcon />
                        </Button>
                        <Button
                            component="label"
                            role={undefined}
                            tabIndex={-1}
                            // startIcon={<AddPhotoAlternateIcon />}
                        >
                            <VisuallyHiddenInput type="file" onChange={handleImageUpload}  />
                            <AddPhotoAlternateIcon />
                        </Button>
                        <Popover
                            id={popoverId}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'center',
                            }}
                            className={styles.transparentChild}
                        >
                        <div>
                            <AnimatePresence>
                                {open && (
                                    <motion.div className='color-picker' style={{ overflow: "hidden" }}
                                        key="color-picker"
                                        initial={{ opacity: 0, scale: 0.25, rotate: -90 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        exit={{ opacity: 0, scale: 0.125, rotate: -90 }}
                                        transition={{
                                            duration: 0.3,
                                            ease: [0, 0.71, 0.45, 1.01],
                                            scale: {
                                                type: "spring",
                                                damping: 15,
                                                stiffness: 100,
                                                restDelta: 0.001
                                            }
                                        }}
                                    >
                                        <HexColorInput className='color-input' color={subtuneData.subtuneColor}  style={{marginBottom: "5px"}}/>
                                        <HexColorPicker color={subtuneData.subtuneColor} onChange={handleColorChange} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </Popover>
                </div>
                </div>
            </form>
        </div>
    )
}