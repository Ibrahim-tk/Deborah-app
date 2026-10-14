"""Prepare the user-requested cutout and lossless growth map. Requires Pillow + NumPy.
Usage: python prepare_bloom.py INPUT.png OUTPUT_DIRECTORY
The alpha cleanup removes the generated low-opacity halo; never key out petal colors.
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
# Normalize the generator's opaque subject (typically alpha 245–254), removing haze.
a[..., 3] = np.round(np.clip((a[..., 3].astype(float) - 190) / 55, 0, 1) * 255).astype('uint8')
im = Image.fromarray(a)
im.thumbnail((736, 484), Image.Resampling.LANCZOS)
# Transparent safety margins keep the mobile canopy clear of screen edges.
art = Image.new('RGBA', (800, 544))
art.alpha_composite(im, ((800-im.width)//2, 544-im.height-30))
a = np.array(art)
alpha = a[...,3] > 20
r,g,b = [a[...,i].astype(float) for i in range(3)]
wood = alpha & (r < 220) & (g < 178) & (b < 165) & (g > b-8) & (r-g < 78)
# A 3px closure bridges antialias gaps along thin branches without imposing a sweep.
mask = np.array(Image.fromarray(wood.astype('uint8')*255).filter(ImageFilter.MaxFilter(3))) > 0
h,w = mask.shape
ys,xs = np.where(wood)
assert len(ys)>100, 'No bark detected; tune the documented color thresholds.'
root_index = np.argmin((xs-w/2)**2 + (ys-h)**2)
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
art.save(dest/'cherry-art.png',optimize=True)
Image.fromarray(out).save(dest/'cherry-map.png',optimize=True)
assert out.shape==a.shape and np.isfinite(canopy).all()
# QA contact sheet: the actual shader equation at five progress stops.
preview=Image.new('RGB',(800*3,544*2),'#fff9ed')
for idx,p in enumerate([0,.19,.4,.58,.78,1]):
    wood_p=np.clip(p/.4,0,1)*1.035
    bloom_p=np.clip((p-.32)/.68,0,1)*1.035
    visible=np.clip((np.where(wood,wood_p,bloom_p)-np.where(wood,out[...,0],out[...,1])/255)/.03,0,1)
    if p==1: visible[:]=1
    frame=a.copy(); frame[...,3]=np.round(a[...,3]*visible).astype('uint8')
    preview.paste(Image.fromarray(frame),(idx%3*800,idx//3*544),Image.fromarray(frame))
preview.resize((1200,544)).save(dest/'growth-preview.jpg')
print({'size':art.size,'root':root,'bark_pixels':int(wood.sum()),'connected_bark_fraction':round(float((wood & connected).sum()/wood.sum()),3),'painted_pixels':int(alpha.sum()),'asset_bytes':sum(p.stat().st_size for p in dest.glob('*.png'))})
