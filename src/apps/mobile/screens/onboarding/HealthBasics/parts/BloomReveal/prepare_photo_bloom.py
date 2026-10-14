"""Prepare the user-requested cutout and lossless growth map. Requires Pillow + NumPy.
Usage: python prepare_bloom.py INPUT.png OUTPUT_DIRECTORY
Preserves the photographic cutout colors and alpha; the growth map is generated separately.
"""
from pathlib import Path
from collections import deque
import sys
import numpy as np
from PIL import Image, ImageFilter

source, dest = Path(sys.argv[1]), Path(sys.argv[2])
dest.mkdir(parents=True, exist_ok=True)
im = Image.open(source).convert('RGBA')
a = np.array(im)
# Preserve the extracted photograph's colors and antialiasing; suppress only near-zero alpha.
a[..., 3][a[..., 3] < 8] = 0
ys, xs = np.where(a[..., 3] > 32)
assert len(ys), 'Empty photographic cutout'
im = Image.fromarray(a).crop((int(xs.min()), int(ys.min()), int(xs.max()+1), int(ys.max()+1)))
im.thumbnail((592, 904), Image.Resampling.LANCZOS)
art = Image.new('RGBA', (640, 960))
art.alpha_composite(im, ((640-im.width)//2, 960-im.height-28))
a = np.array(art)
alpha = a[...,3] > 20
r,g,b = [a[...,i].astype(float) for i in range(3)]
wood = alpha & (r > b*1.07) & (g > b*.9) & (r >= g*.95) & (r+g+b < 500) & (r-g < 70)
# A 3px closure bridges antialias gaps along thin branches without imposing a sweep.
mask = np.array(Image.fromarray(wood.astype('uint8')*255).filter(ImageFilter.MaxFilter(3))) > 0
h,w = mask.shape
ys,xs = np.where(wood)
assert len(ys)>100, 'No bark detected; tune the documented color thresholds.'
# Locate the lowest bark, rather than assuming the photographed trunk is centered.
bottom = ys.max()
base_x = np.median(xs[ys >= bottom-3])
root_index = np.argmin((xs-base_x)**2 + (ys-bottom)**2)
root = (int(ys[root_index]),int(xs[root_index]))
dist = np.full((h,w),-1,dtype=np.int32)
dist[root]=0
q=deque([root])
while q:
    y,x=q.popleft()
    for dy,dx in ((0,1),(1,0),(0,-1),(-1,0),(1,1),(-1,-1),(1,-1),(-1,1)):
        yy,xx=y+dy,x+dx
        if 0<=yy<h and 0<=xx<w and mask[yy,xx] and dist[yy,xx]<0:
            dist[yy,xx]=dist[y,x]+1
            q.append((yy,xx))
connected=dist>=0
detected_wood = wood.copy()
# Dark flower centers and disconnected branch fragments emerge with their surrounding canopy.
wood = wood & connected
assert connected.sum()>500, 'Trunk is disconnected; inspect the bark mask.'
wood_time=np.zeros((h,w),dtype=float)
wood_time[connected]=dist[connected]/max(1,dist.max())
# Multi-source nearest-branch fill: inherit arrival time from reachable bark.
nearest=wood_time.copy()
space=np.full((h,w),-1,dtype=np.int32)
space[connected]=0
q=deque(map(tuple,np.argwhere(connected)))
while q:
    y,x=q.popleft()
    for dy,dx in ((0,1),(1,0),(0,-1),(-1,0)):
        yy,xx=y+dy,x+dx
        if 0<=yy<h and 0<=xx<w and space[yy,xx]<0:
            space[yy,xx]=space[y,x]+1
            nearest[yy,xx]=nearest[y,x]
            q.append((yy,xx))
wood_time[~connected]=nearest[~connected]
noise=np.random.default_rng(17).integers(0,256,(h,w),dtype=np.uint8)
noise=np.array(Image.fromarray(noise).filter(ImageFilter.GaussianBlur(9))).astype(float)
noise=(noise-noise.min())/max(1,np.ptp(noise))
canopy=nearest*.58 + np.clip(space/50,0,1)*.3 + noise*.12
flowers=alpha & ~wood
lo,hi=np.percentile(canopy[flowers],[0,100])
canopy=np.clip((canopy-lo)/max(1e-6,hi-lo),0,1)
out=np.zeros((h,w,4),dtype=np.uint8)
out[...,0]=np.round(wood_time*255).astype('uint8')
out[...,1]=np.round(canopy*255).astype('uint8')
out[...,2]=np.where(wood,255,0)
out[...,3]=a[...,3]
art.save(dest/'photo-jacaranda-art.png',optimize=True)
Image.fromarray(out).save(dest/'photo-jacaranda-map.png',optimize=True)
assert out.shape==a.shape and np.isfinite(canopy).all()
# QA contact sheet: the actual shader equation at five progress stops.
preview=Image.new('RGB',(w*3,h*2),'#fff9ed')
for idx,p in enumerate([0,.19,.4,.58,.78,1]):
    wood_p=np.clip(p/.4,0,1)*1.035
    bloom_p=np.clip((p-.32)/.68,0,1)*1.035
    visible=np.clip((np.where(wood,wood_p,bloom_p)-np.where(wood,out[...,0],out[...,1])/255)/.03,0,1)
    if p==1: visible[:]=1
    frame=a.copy(); frame[...,3]=np.round(a[...,3]*visible).astype('uint8')
    preview.paste(Image.fromarray(frame),(idx%3*w,idx//3*h),Image.fromarray(frame))
preview.resize((960,960)).save(dest/'growth-preview.jpg')
print({'size':art.size,'root':root,'bark_pixels':int(wood.sum()),'connected_bark_fraction':round(float((detected_wood & connected).sum()/detected_wood.sum()),3),'painted_pixels':int(alpha.sum()),'asset_bytes':sum(p.stat().st_size for p in dest.glob('*.png'))})
