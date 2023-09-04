from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from secrets import token_hex
import pathlib
import tensorflow as tf
import cv2

app = FastAPI()

vocab = [x for x in "abcdefghijklmnopqrstuvwxyz'?!123456789 "]
char_to_num = tf.keras.layers.StringLookup(vocabulary=vocab, oov_token="")
num_to_char = tf.keras.layers.StringLookup(
    vocabulary=char_to_num.get_vocabulary(), oov_token="", invert=True
)

model = tf.keras.models.load_model("model_v1.h5")

class PredictionOut(BaseModel):
    output_txt: str


@app.get("/")
def home():
    return {"name": "hello"}

@app.post("/predict", response_model=PredictionOut)
async def predict(video_file: UploadFile):
    file_ext = video_file.filename.split(".").pop()
    file_name = token_hex(10)
    file_path = f"{file_name}.{file_ext}"
    with open(file_path, "wb") as f:
        contents = await video_file.read()
        f.write(contents)
    
    cap = cv2.VideoCapture(file_path)
    frames = []
    for _ in range(int(cap.get(cv2.CAP_PROP_FRAME_COUNT))): 
        ret, frame = cap.read()
        frame = tf.image.rgb_to_grayscale(frame)
        frames.append(frame[190:236,80:220,:])
    cap.release()

    mean = tf.math.reduce_mean(frames)
    std = tf.math.reduce_std(tf.cast(frames, tf.float32))
    sample = tf.cast((frames - mean), tf.float32) / std
    yhat = model.predict(tf.expand_dims(sample, axis=0))
    decoded = tf.keras.backend.ctc_decode(yhat, input_length=[75], greedy=True)[0][0].numpy()
    tensor_str = [tf.strings.reduce_join([num_to_char(word) for word in sentence]) for sentence in decoded]
    output_txt = str(tensor_str)
    output_txt = output_txt[45:-3]

    pathlib.Path(file_path).unlink()
    return {
        "output_txt": output_txt
        }