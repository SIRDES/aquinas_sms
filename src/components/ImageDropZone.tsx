import { Box, Button, Typography } from "@mui/material";
import Image from "next/image";
import {
    CSSProperties,
    Dispatch,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useDropzone } from "react-dropzone";

const baseStyle: CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px",
    borderWidth: 2,
    borderRadius: 2,
    borderColor: "#eeeeee",
    borderStyle: "dashed",
    // backgroundColor: '#fafafa',
    color: "#bdbdbd",
    outline: "none",
    transition: "border .24s ease-in-out",
};

const focusedStyle = {
    borderColor: "#2196f3",
};

const acceptStyle = {
    borderColor: "#00e676",
};

const rejectStyle = {
    borderColor: "#ff1744",
};
const thumbsContainer: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
};

const thumb: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    borderRadius: 2,
    border: "1px solid #eaeaea",
    marginBottom: 8,
    marginRight: 8,
    // width: 100,
    // height: 100,
    padding: 4,
    boxSizing: "border-box",
};

const thumbInner: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    // overflow: "hidden",
};

const img: CSSProperties = {
    display: "block",
    width: "auto",
    height: "100%",
};
export type FileType = {
    file: File;
    preview: string;
};
export default function ImagesDropzone({
    setSelectedImages,
    selectMultiple = false,
}: {
    setSelectedImages: Dispatch<SetStateAction<FileType[] | null>>;
    selectMultiple?: boolean;
}) {
    const [files, setFiles] = useState<Array<FileType> | null>(null);
    const onDrop = useCallback((acceptedFiles: File[] | null) => {
        // Do something with the files
        if (acceptedFiles) {
            const filesWithPreviews: Array<FileType> = acceptedFiles.map((file) => {
                return {
                    preview: URL.createObjectURL(file),
                    file,
                };
            });
            setFiles((prev: Array<FileType> | null) => {
                if (prev) {
                    return [...prev, ...filesWithPreviews];
                }
                return [...filesWithPreviews];
            });
        }
    }, []);
    useEffect(() => {
        setSelectedImages(files);
        // eslint-disable-next-line
    }, [files]);
    const {
        getRootProps,
        getInputProps,
        isDragActive,
        fileRejections,
        open,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        onDrop,
        noClick: true,
        noKeyboard: true,
        maxFiles: selectMultiple ? 0 : 1,
        maxSize: 2 * 1024 * 1024, // 2MB
        accept: {
            "image/*": [],
        },
    });
    const style: any = useMemo(
        () => ({
            ...baseStyle,
            ...(isFocused ? focusedStyle : {}),
            ...(isDragAccept ? acceptStyle : {}),
            ...(isDragReject ? rejectStyle : {}),
        }),
        [isFocused, isDragAccept, isDragReject]
    );

    const handleRemoveImage = (fileIndex: number) => {
        if (files) {
            const filteredFiles: any[] = files.filter(
                (file: any, index: any) => index !== fileIndex
            );
            setFiles(filteredFiles);
            return;
        }
    };
    const ImagePreviews = files?.map((file: any, index: number) => (
        <div style={thumb} key={index}>
            <div style={thumbInner}>
                <Image
                    src={file?.preview}
                    // style={img}
                    height={100}
                    width={100}
                    // Revoke data uri after image is loaded
                    // onLoad={() => {
                    //   URL.revokeObjectURL(file?.preview);
                    // }}
                    alt={`project image ${index}`}
                />
                <Typography
                    variant="caption"
                    color="error"
                    onClick={() => handleRemoveImage(index)}
                    sx={{ cursor: "pointer" }}
                >
                    Remove
                </Typography>
            </div>
        </div>
    ));

    // useEffect(() => {
    //   // Make sure to revoke the data uris to avoid memory leaks, will run on unmount

    //   return () =>
    //     files?.forEach((file: any) => URL.revokeObjectURL(file?.preview));
    // }, []);
    return (
        <Box>
            {(files === null || files?.length === 0) && (
                <Box component={"div"} {...getRootProps({ style })}>
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p>Drop the files</p>
                    ) : (
                        <Box
                            display="flex"
                            alignItems="center"
                            flexDirection="column"
                            gap={2}
                            p={1}
                        >
                            <Button variant="contained" onClick={open}>
                                Choose file
                            </Button>
                            <Box>
                                <Typography color="text.disabled" align="center">
                                    Or drag file in here
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                    Upload a passport-size photo
                                </Typography>
                                <br />
                                <Typography variant="caption" color="text.disabled">
                                    File Format jpeg, png Recommened Size 600x600 (1:1)
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

            <Box style={thumbsContainer}>{ImagePreviews}</Box>
            <Typography variant="body2" color="error">
                {fileRejections[0]?.errors[0]?.message}
            </Typography>
        </Box>
    );
}