import SVGClosePathCommand from "../data/path/SVGClosePathCommand";
import SVGArcToCommand from "../data/path/SVGArcToCommand";
import SVGCurveToCubicCommand from "../data/path/SVGCurveToCubicCommand";
import SVGCurveToCubicSmoothCommand from "../data/path/SVGCurveToCubicSmoothCommand";
import SVGCurveToQuadraticCommand from "../data/path/SVGCurveToQuadraticCommand";
import SVGCurveToQuadraticSmoothCommand from "../data/path/SVGCurveToQuadraticSmoothCommand";
import SVGLineToCommand from "../data/path/SVGLineToCommand";
import SVGLineToHorizontalCommand from "../data/path/SVGLineToHorizontalCommand";
import SVGLineToVerticalCommand from "../data/path/SVGLineToVerticalCommand";
import SVGMoveToCommand from "../data/path/SVGMoveToCommand";
import Geom from "../../utils/Geom";
import Matrix from "../../geom/Matrix";
import Rectangle from "../../geom/Rectangle";


export default class SVGParserCommon
{
    /**
     * @param input {string}
     * @return {Array}
     */
    static parsePathData(input) {
        let commands = [];

        input.match(/[A-DF-Za-df-z][^A-Za-df-z]*/g).forEach(function(commandString) {
            let type = commandString.charAt(0);
            let args = SVGParserCommon.splitNumericArgs(commandString.substr(1));

            if(type === "Z" || type === "z"){
                commands.push(new SVGClosePathCommand());
            }	else {
				let a = 0;
				while (a<args.length) {
                    if (type === "M" && a > 0) //Subsequent pairs of coordinates are treated as implicit lineto commands
                        type = "L";
                    if (type === "m" && a > 0) //Subsequent pairs of coordinates are treated as implicit lineto commands
                        type = "l";

                    switch (type) {
                        case "M" :
                        case "m" :
                            commands.push(new SVGMoveToCommand(type === "M", Number(args[a++]), Number(args[a++])));
                            break;
                        case "L" :
                        case "l" :
                            commands.push(new SVGLineToCommand(type === "L", Number(args[a++]), Number(args[a++])));
                            break;
                        case "H" :
                        case "h" :
                            commands.push(new SVGLineToHorizontalCommand(type === "H", Number(args[a++])));
                            break;
                        case "V" :
                        case "v" :
                            commands.push(new SVGLineToVerticalCommand(type === "V", Number(args[a++])));
                            break;
                        case "Q" :
                        case "q" :
                            commands.push(new SVGCurveToQuadraticCommand(type === "Q", Number(args[a++]), Number(args[a++]), Number(args[a++]), Number(args[a++])));
                            break;
                        case "T" :
                        case "t" :
                            commands.push(new SVGCurveToQuadraticSmoothCommand(type === "T", Number(args[a++]), Number(args[a++])));
                            break;
                        case "C" :
                        case "c" :
                            commands.push(new SVGCurveToCubicCommand(type === "C", Number(args[a++]), Number(args[a++]), Number(args[a++]), Number(args[a++]), Number(args[a++]), Number(args[a++])));
                            break;

                        case "S" :
                        case "s" :
                            commands.push(new SVGCurveToCubicSmoothCommand(type === "S", Number(args[a++]), Number(args[a++]), Number(args[a++]), Number(args[a++])));
                            break;

                        case "A" :
                        case "a" :
                            commands.push(new SVGArcToCommand(type === "A", Number(args[a++]), Number(args[a++]), Number(args[a++]), args[a++] !== "0", args[a++] !== "0", Number(args[a++]), Number(args[a++])));
                            break;

                        default :
                            console.log("Invalid PathCommand type: " + type);
                            a = args.length; //Break args loop
                    }
                }
            }
		});

        return commands;
    }

    /**
     * @param input
     * @return {Array}
     */
    static splitNumericArgs(input) {
        let returnData = [];
        // @TODO: confirm that the regexp change works well
        //input.match(/(?:\+|-)?(?:(?:\d*\.\d+)|(?:\d+))(?:e(?:\+|-)?\d+)?/g).forEach(function(numberString){
        input.match(/[+\-]?(?:(?:\d*\.\d+)|(?:\d+))(?:e[+\-]?\d+)?/g).forEach(function(numberString){
			returnData.push(numberString);
		});
        return returnData;
    }

    /**
     * @param m {string}
     * @return {Matrix}
     */
    static parseTransformation(m) {
        if(m.length === 0) {
            return new Matrix();
        }

        let transformations = m.match(/(\w+?\s*\([^)]*\))/g);

        let mat = new Matrix();

        if(transformations && transformations.length){
            for(let i = transformations.length - 1; i >= 0; i--)
            {
                let parts = /(\w+?)\s*\(([^)]*)\)/.exec(transformations[i]);
                if (parts && parts.length){
					let name = parts[1].toLowerCase();
					let args = SVGParserCommon.splitNumericArgs(parts[2]);

					switch(name){
						case "matrix" :
							mat.concat(new Matrix(Number(args[0]), Number(args[1]), Number(args[2]), Number(args[3]), Number(args[4]), Number(args[5])));
							break;
						case "translate" :
							mat.translate(Number(args[0]), args.length > 1 ? Number(args[1]) : 0);
							break;
						case "scale" :
							mat.scale(Number(args[0]), args.length > 1 ? Number(args[1]) : Number(args[0]));
							break;
						case "rotate" :
							if(args.length > 1){
								let tx = args.length > 1 ? Number(args[1]) : 0;
								let ty = args.length > 2 ? Number(args[2]) : 0;
								mat.translate(-tx, -ty);
								mat.rotate(Geom.deg2rad(Number(args[0])));
								mat.translate(tx, ty);
							} else {
								mat.rotate(Geom.deg2rad(Number(args[0])));
							}
							break;
						case "skewx" :
							let skewXMatrix = new Matrix();
							skewXMatrix.c = Math.tan(Geom.deg2rad(Number(args[0])));
							mat.concat(skewXMatrix);
							break;
						case "skewy" :
							let skewYMatrix = new Matrix();
							skewYMatrix.b = Math.tan(Geom.deg2rad(Number(args[0])));
							mat.concat(skewYMatrix);
							break;

                        default:
                            break;
					}
				}
            }
        }

        return mat;
    }

    /**
     * @param viewBox {string}
     * @return {Rectangle}
     */
    static parseViewBox(viewBox) {
        if(viewBox == null || viewBox === "") {
            return null;
        }
        let params = viewBox.split(/\s/);
        return new Rectangle(
            parseFloat(params[0]), parseFloat(params[1]), parseFloat(params[2]), parseFloat(params[3])
        );
    }

    /**
     * @param text {string}
     * @return {{defer: boolean, align: (string), meetOrSlice: (string)}}
     */
    static parsePreserveAspectRatio(text) {
        let parts = /(?:(defer)\s+)?(\w*)(?:\s+(meet|slice))?/gi.exec(text.toLowerCase());

        return {
            defer: parts[1] !== undefined,
            align: parts[2] || "xmidymid",
            meetOrSlice: parts[3] || "meet"
        };
    }
}