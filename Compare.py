import csv
import json
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

filenames = ["columbia", "philadelphia", "royal", "slovak", "langlang"]

data = {}
for filename in filenames:
    with open('./output/data/%s.csv' % filename, 'r') as csvfile:
        data[filename] = [];
        spamreader = csv.reader(csvfile, quoting=csv.QUOTE_NONNUMERIC)
        for row in spamreader:
            data[filename] += row

colors = ['red', 'orange', 'yellow', 'green', 'blue']
fig = plt.figure(figsize=(12, 8), frameon=True)
plt.title("All Five Glissandos", fontsize=24)
ax = fig.gca()
ax.tick_params(labelsize=18)

for f,filename in enumerate(filenames):
    ax.plot(data[filename], '.g', color=colors[f], label=filename)
lgd = plt.legend(bbox_to_anchor=(1.05, 1), loc=2, borderaxespad=0.)

image_path = "./output/images/comparison.png"
fig.savefig(image_path, bbox_extra_artists=(lgd,), bbox_inches='tight', dpi=300)

with open('./output/data/glissandos.json', 'w') as f:
    json.dump(data, f, ensure_ascii=False)
