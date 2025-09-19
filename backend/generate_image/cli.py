from __future__ import annotations

import argparse
from pathlib import Path

from .client import FreepikImageClient


def main() -> None:
    parser = argparse.ArgumentParser(description="Freepik API を用いた画像生成CLI")
    parser.add_argument("prompt", type=str, help="画像生成のプロンプト")
    parser.add_argument("--aspect-ratio", dest="aspect_ratio", type=str, default=None, help="例: widescreen_16_9, 1:1 など")
    parser.add_argument("--size", dest="size", type=str, default=None, help="例: 1024x1024 など")
    parser.add_argument("--n", dest="num_images", type=int, default=1, help="生成枚数")
    parser.add_argument("--out", dest="output_dir", type=str, default=None, help="保存先ディレクトリ")
    parser.add_argument("--prefix", dest="prefix", type=str, default="freepik", help="保存ファイル名の接頭辞")

    args = parser.parse_args()

    client = FreepikImageClient.from_env()
    out_dir = Path(args.output_dir) if args.output_dir else None

    paths = client.generate_image(
        prompt=args.prompt,
        aspect_ratio=args.aspect_ratio,
        size=args.size,
        num_images=args.num_images,
        output_dir=out_dir,
        filename_prefix=args.prefix,
    )

    for p in paths:
        print(str(p))


if __name__ == "__main__":
    main()


