import { useState } from "react";


import styles from "./Component.module.css"

import { HexColorPicker, HexColorInput } from "react-colorful";
import { AnimatePresence, motion } from "framer-motion";


import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import { tune } from "../../subtuneTypes/Tune";
import { read } from "fs";



export const SubtuneForm = ({ children, style }) => {
    const reader = new FileReader();

    const [subtuneColor, setSubtuneColor] = useState("#0000");
    const [compColor, setCompColor] = useState("#0000");
    const [angle, setAngle] = useState(225);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [subtuneData, setSubtuneData] = useState<{
        title: string;
        description: string;
        subtuneColor: string;
        subtuneImage: File | null;
        subtuneTuneIds: tune[];
    }>({
        title: "",
        description: "",
        subtuneColor: "",
        subtuneImage: null,
        subtuneTuneIds: [],
    });


    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const popoverId = open ? 'colorPickerPopover' : undefined;


    const subtuneStyle = {
        ...styles,
        padding: "1rem",
        position: "relative",
        borderRadius: "16px",
        background: `linear-gradient(${angle}deg, ${subtuneData.subtuneColor}, ${compColor})`,
    }

    const subtuneFormStyle = {
        // background: "rgba(0,0,0,0.8)",
        backgroundImage: `url(${imageFile})`,
        backgroundSize: "cover",
        height: "100%",
        borderRadius: "8px",
        boxShadow: "0 0 10px 0 rgba(0,0,0,0.5)",
    }

    const subtuneforegroundStyle = {
        backdropFilter: "blur(20px) brightness(0.45)",
        width: "100%",
        height: "100%",
        borderRadius: "8px",
        padding: "2rem",
    }

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

    const fieldStyle = {
        background: "rgba(0,0,0,0.1)",
        color: "white",
        margin: "5px",
        padding: "5px",
        borderRadius: "5px",
        boxShadow: "0 0 5px 0 rgba(0,0,0,0.5)",
        outlineStyle: "none",
    }

    const findComplementaryColor = (subtuneColor: string) => {
        const rgb = subtuneColor.match(/\w\w/g).map(x => parseInt(x, 16));
        const complementaryRgb = rgb.map(x => 255 - x);
        const complementaryColor = `#${complementaryRgb.map(x => x.toString(16).padStart(2, '0')).join('')}`;
        setCompColor(complementaryColor);
    };

    const handleColorChange = (color: string) => {
        findComplementaryColor(color);
        // console.log("color: ", color, "compColor: ", compColor);
        setAngle((angle) => angle + 5 % 360);
        setSubtuneData({ ...subtuneData, subtuneColor: color });
    }
    
    const handleImageUpload = (e) => {
        e.target.files && e.target.files[0] ? setSubtuneData({...subtuneData, subtuneImage: e.target.files[0]}) : null
        
        // we first read the contents of the file and store it in the file reader object
        if (e.target.files[0]){
            reader.readAsDataURL(e.target.files[0]);
        }

        // then we store it in state var
        reader.onload = () => {
            setImageFile(reader.result);
        }
    }

    

    // TODO: implement handleSubmit of subtune form
    const handleSubmit = async (event) => {
        event.preventDefault(); // prolly wanna have this
        console.log("children: ", children);
        console.log("event", event);

        // TODO: Implement logic to submit the subtune
        // const tune_ids = children.props.tunes.map(tune => tune.id);
        subtuneData.subtuneTuneIds = children.props.tunes.map(tune => tune.id);

        const data = {
            "name": subtuneData.title,
            "description": subtuneData.description,
            "tunes": subtuneData.subtuneTuneIds,
            "color": subtuneData.subtuneColor,
            "image": subtuneData.subtuneImage
        };


        const formData = new FormData();
        formData.append("data", JSON.stringify(data));

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


    function handleChange(event) {
        // testing how to get tune objects from children components
        console.log("tunes: ", children.props.tunes)
    }


    return (
        <div style={subtuneStyle}>
            <form onSubmit={handleSubmit} style={subtuneFormStyle}>
                <div style={subtuneforegroundStyle}>
                    <Stack
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        spacing={2}
                        style={{ marginBottom: "1rem" }}
                    >
                        <Button type="submit" color="primary" variant="contained" ><SaveRoundedIcon /></Button>
                        <Button type="button" color="primary" variant="contained"><DeleteOutlineRoundedIcon /></Button>
                        <Button aria-describedby={popoverId} color="primary" onClick={handleClick} variant="contained">
                            <ColorLensRoundedIcon />
                        </Button>
                        <Button
                            component="label"
                            role={undefined}
                            tabIndex={-1}
                            // startIcon={<AddPhotoAlternateIcon />}
                            variant="contained"
                        >
                            <VisuallyHiddenInput type="file" onChange={handleImageUpload}  />
                            <AddPhotoAlternateIcon />
                        </Button>
                        {
                            imageFile ?
                            <img src={imageFile} alt="subtuneImage" style={{width: "80px", border: "2px solid white", borderRadius: "5px"}} /> : null
                        }
                    </Stack>
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
                    <Stack
                        direction="row"
                        justifyContent="space-evenly"
                        alignItems="center"
                        spacing={0.25}
                    >
                        <div className="">
                            <input className="field"
                                style={fieldStyle}
                                name="title"
                                type="text"
                                placeholder="Title"
                                maxLength={100}
                                size={40}
                                value={subtuneData.title}
                                onChange={(e) => setSubtuneData({ ...subtuneData, title: e.target.value })}
                            />
                        </div>
                        <div className="">
                            <input className='field'
                                style={fieldStyle}
                                name="description"
                                type="text"
                                placeholder="Description"
                                maxLength={100}
                                size={40}
                                value={subtuneData.description}
                                onChange={(e) => setSubtuneData({ ...subtuneData, description: e.target.value })}
                            />
                        </div>
                    </Stack>
                    {children}
                </div>
            </form>
        </div>
    )
}

export default SubtuneForm;