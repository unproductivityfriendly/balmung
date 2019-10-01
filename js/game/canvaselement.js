export class Shape {
	constructor(x=0, y=0, w=1, h=1, fill="#AAAAAA") {
		this.x = x
		this.y = y
		this.w = w
		this.h = h
		this.fill = fill
	}

	draw(ctx) {
		ctx.fillStyle = this.fill
		ctx.fillRect(this.x, this.y, this.w, this.h)
	}

	
}