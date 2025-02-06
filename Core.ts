/**
 * @package OpenUSD-ts
 * @file Core.ts
 * @description
 * @author gh Corgice @IceSandwich
 * @license GPL v3
 */

export namespace Usd {
	export enum NodeType {
		BaseObject,
		Stage,

		/* Geom */
		Xform = "Xform",
		Mesh = "Mesh",

		/* Material */
		Shader = "Shader",
		Material = "Material",

		/* Skeleton */
		SkelRoot = "SkelRoot",
		Skeleton = "Skeleton",
	}

	export enum SchemaType {
		SkelBindingAPI = "SkelBindingAPI",
		MaterialBindingAPI = "MaterialBindingAPI",
	}

	export class Point2 {
		X: number = 0;
		Y: number = 0;
		constructor(x: number, y: number) {
			this.X = x;
			this.Y = y;
		}
		Multiply(other: Point2): Point2   {
			return new Point2(this.X  * other.X, this.Y  * other.Y);
		}
		Plus(other: Point2): Point2   {
			return new Point2(this.X + other.X, this.Y + other.Y);
		}
		Dot(other: Point2): number {
			return this.X * other.X + this.Y * other.Y;
		}
		Length2(): number  {
			return this.X * this.X + this.Y * this.Y;
		}
		Normalize(): Point2  {
			let length = Math.sqrt(this.Length2());
			return new Point2(this.X / length, this.Y  / length);
		}
	}

	export class Point3 {
		X: number = 0;
		Y: number = 0;
		Z: number = 0;
		constructor(x: number, y: number, z: number) {
			this.X = x;
			this.Y = y;
			this.Z = z;
		}
		Dot(other: Point3): number {
			return (this.X * other.X) + (this.Y * other.Y) + (this.Z * other.Z);
		}
		Multiply(other: Point3): Point3  {
			return new Point3(this.X * other.X, this.Y * other.Y, this.Z * other.Z);
		}
		Divide(other: Point3): Point3   {
			return new Point3(this.X / other.X, this.Y / other.Y, this.Z / other.Z);
		}
		Plus(other: Point3): Point3  {
			return new Point3(this.X + other.X, this.Y + other.Y, this.Z + other.Z);
		}
		Length2(): number {
			return this.X * this.X + this.Y * this.Y + this.Z * this.Z;
		}
		Normalize(): Point3 {
			let length = Math.sqrt(this.Length2());
			return new Point3(this.X / length, this.Y / length, this.Z / length);
		}
	}

	export class Point4 {
		X: number = 0;
		Y: number = 0;
		Z: number = 0;
		W: number = 1;
		constructor(x: number, y: number, z: number, w: number) {
			this.X = x;
			this.Y = y;
			this.Z = z;
			this.W = w;
		}
		Dot(other: Point4): number  {
			return (this.X * other.X) + (this.Y * other.Y) + (this.Z * other.Z) + (this.W * other.W);
		}
	}

	/**
	 * Column-major matrix
	 */
	export class Matrix4 {
		M0: Point4 = new Point4(1,0,0,0);
		M1: Point4 = new Point4(0,1,0,0);
		M2: Point4 = new Point4(0,0,1,0);
		M3: Point4 = new Point4(0,0,0,1);
		constructor(m0: Point4, m1: Point4, m2: Point4, m3: Point4) {
			this.M0 = m0;
			this.M1 = m1;
			this.M2 = m2;
			this.M3 = m3;
		}
		Transpose() {
			return new Matrix4(
				new Point4(this.M0.X, this.M1.X, this.M2.X, this.M3.X),
				new Point4(this.M0.Y, this.M1.Y, this.M2.Y, this.M3.Y),
				new Point4(this.M0.Z, this.M1.Z, this.M2.Z, this.M3.Z),
				new Point4(this.M0.W, this.M1.W, this.M2.W, this.M3.W)
			);
		}
		Mulptiply(lefthand: Matrix4) {
			let lhT = lefthand.Transpose();
			return new Matrix4(
				new Point4(lhT.M0.Dot(this.M0), lhT.M1.Dot(this.M0), lhT.M2.Dot(this.M0), lhT.M3.Dot(this.M0)),
				new Point4(lhT.M0.Dot(this.M1), lhT.M1.Dot(this.M1), lhT.M2.Dot(this.M1), lhT.M3.Dot(this.M1)),
				new Point4(lhT.M0.Dot(this.M2), lhT.M1.Dot(this.M2), lhT.M2.Dot(this.M2), lhT.M3.Dot(this.M2)),
				new Point4(lhT.M0.Dot(this.M3), lhT.M1.Dot(this.M3), lhT.M2.Dot(this.M3), lhT.M3.Dot(this.M3))
			);
		}
	}

	export enum DataType {
		Bool,
		Token = "token",
		Asset = "asset",
		Int = "int",
		Float = "float",
		Float2 = "float2",
		TexCoord2f = "texCoord2f",
		Float3 = "float3",
		Float3d = "float3d",
		Point3f = "point3f",
		Color3f = "color3f",
		Normal3f = "normal3f",
		Matrix4d = "matrix4d",
	}

	class SdfPath {
		Path: string[] = [];
		constructor(rootName?: string) {
			if (typeof rootName !== "undefined") {
				this.Path = [rootName];
			}
		}
		AddChild(childName: string) {
			this.Path.push(childName);
			return this;
		}
		AddProperty(propertyName: string) {
			this.Path[this.Path.length -1] += "." + propertyName;
			return this;
		}
		ToString(): string {
			return "/" + this.Path.join("/");
		}
	}

	interface ICanGenerateSdfPath {
		GenerateSdfPath(): SdfPath;
	}

	export class AttributeModifications {
		IsUniform: boolean = false;
		IsPrepend: boolean = false;
		IsEmptyValue: boolean = false;

		IsRefLink: boolean = false;
		ShowRefTag: boolean = true;

		Uniform(value: boolean = true) {
			this.IsUniform = value;
			return this;
		}
		Prepend(value: boolean = true) {
			this.IsPrepend  = value;
			return this;
		}
		EmptyValue(value: boolean = true) {
			this.IsEmptyValue = value;
			return this;
		}
		RefLink(refLink:boolean = true, showLinkTag: boolean = true) {
			this.IsRefLink = refLink;
			this.ShowRefTag = showLinkTag;
			return this;
		}
	}
	
	abstract class Attribute implements ICanGenerateSdfPath {
		Name: string;
		Type: DataType;
		Value: any;
		Modifications: AttributeModifications;
		protected m_belongTo: ICanGenerateSdfPath | null = null; /* friend member shared by BaseObject */
		constructor(name: string, value: any, type: DataType, modifications?: AttributeModifications) {
			this.Name = name;
			this.Type = type;
			this.Modifications = modifications ? modifications : new AttributeModifications();
			// if (Array.isArray(value)) {
			//     for (var i = 0; i < value.length; i++) {
			//         if (typeof this.Type == "object") {
			//             throw new Error(`The items of ${name} must have same element types! The defined one is ${this.Type} but at ${i} is ${t}.`);
			//         }
			//     }
			// }
			this.Value = value;
		}

		protected prefixNameString(): string {
			let ret = "";
			if (this.Modifications.IsRefLink && this.Modifications.ShowRefTag) {
				ret += "rel ";
			}
			if (this.Modifications.IsPrepend) {
				ret += "prepend ";
			}
			if (this.Modifications.IsUniform) {
				ret += "uniform ";
			}
			return ret;
		}
		private isSameTypeForSingleValue(value: any) {
			switch (typeof value) {
				case "boolean":
					return this.Type == DataType.Bool;
				case "string":
					return this.Type == DataType.Token;
				case "number":
					return this.Type == DataType.Int || this.Type == DataType.Float;
				case "object":
					if (value instanceof Point3) {
						return this.Type == DataType.Float3 || this.Type == DataType.Point3f;
					}
					// [[fallthrough]]
				default:
					throw new Error(`Unknow type ${typeof value} for ${value}`);
			}
		}

		protected valueToString(): string {
			const singleValueToString = (value: any): string => {
				if (value == null) {
					throw Error(`The value of ${this.m_belongTo?.GenerateSdfPath().ToString()}/${this.Name} must not be null!`);
				}
				if (this.Modifications.IsRefLink) {
					return `<${value.GenerateSdfPath().ToString()}>`;
				}
				switch (this.Type) {
					case DataType.Bool:
						return value == true ? "true" : "false";
					case DataType.Asset:
						return `@${value}@`; // asset path
					case DataType.Token:
						// if (this.Name === "references") {
						//     return `@${value}@`; // reference path
						// }
						return `"${value}"`; // TODO: solve escape character '\'
					case DataType.Int:
					case DataType.Float:
						return String(value);
					case DataType.Float2:
					case DataType.TexCoord2f:
						let v2 = value as Point2;
						return `(${v2.X}, ${v2.Y})`
					case DataType.Float3:
					case DataType.Float3d:
					case DataType.Point3f:
					case DataType.Color3f:
					case DataType.Normal3f:
						let v3 = value as Point3;
						return `(${v3.X}, ${v3.Y}, ${v3.Z})`;
					case DataType.Matrix4d:
						let m4 = value as Matrix4;
						return `( (${m4.M0.X}, ${m4.M0.Y}, ${m4.M0.Z}, ${m4.M0.W}), (${m4.M1.X}, ${m4.M1.Y}, ${m4.M1.Z}, ${m4.M1.W}), (${m4.M2.X}, ${m4.M2.Y}, ${m4.M2.Z}, ${m4.M2.W}), (${m4.M3.X}, ${m4.M3.Y}, ${m4.M3.Z}, ${m4.M3.W}) )`;
					default:
						throw new Error(`Cannot decode the type ${this.Type} to string.`);
				}
			}

			if (this.Modifications.IsEmptyValue) {
				return "";
			}

			if (Array.isArray(this.Value)) {
				return " = [" + this.Value.map(singleValueToString).join(", ") + "]";
			} else {
				return " = " + singleValueToString(this.Value);
			}
		}

		GenerateSdfPath(): SdfPath {
			if (this.m_belongTo == null) {
				return new SdfPath();
			}
			return this.m_belongTo.GenerateSdfPath().AddProperty(this.Name);
		}

		abstract ToString(): string[];
	}

	const indent = "\t";

	export class Metadata extends Attribute {
		ToString(): string[] {
			return [
				`${this.prefixNameString()}${this.Name}${this.valueToString()}`
			];
		}
	}
	export class Property extends Attribute {
		protected m_metadatas: Metadata[] = [];

		AddMetadata(metadata: Attribute) {
			this.m_metadatas.push(metadata);
			return this;
		}
		
		ToString(): string[] {
			let metadatas = this.m_metadatas.map(item => indent + item.ToString()[0]);
			let arrayTag = Array.isArray(this.Value) ? "[]" : "";
			let type = this.Modifications.IsRefLink && this.Modifications.ShowRefTag ? "" : this.Type;
			let ret = [
				`${this.prefixNameString()}${type}${arrayTag} ${this.Name}${this.valueToString()}`
			]
			if (metadatas.length != 0) {
				ret[ret.length - 1] = ret[ret.length - 1] + " (";
				ret.push(...metadatas);
				ret.push(")");
			}
			return ret;
		}
	}

	export abstract class BaseObject implements ICanGenerateSdfPath {
		private m_type: NodeType;
		protected m_name: string;
		protected m_metadatas: Metadata[] = [];
		protected m_properties: Property[] = [];
		protected m_children: BaseObject[] = [];
		protected m_parent: BaseObject | null = null;
		UserData: any | null = null;
		protected constructor(nodeType: NodeType, name: string) {
			this.m_type = nodeType;
			this.m_name = name.replaceAll('.', '_').replaceAll("-", "_").replaceAll(' ', '');
		}
		GetType() {
			return this.m_type;
		}
		GetName() {
			return this.m_name;
		}
		GetChildren() {
			return this.m_children;
		}

		AddMetadata(metadata: Metadata) {
			this.m_metadatas.push(metadata);
			let newone = this.m_metadatas[this.m_metadatas.length - 1];
			(newone as any).m_belongTo = this;
			return newone;
		}

		AddProperty(property: Property) {
			this.m_properties.push(property);
			let newone = this.m_properties[this.m_properties.length - 1];
			(newone as any).m_belongTo  = this;
			return newone;
		}

		SetReferenceFile(path: string, isPrepend: boolean = false) {
			return this.AddMetadata(new Usd.Metadata("references", path, Usd.DataType.Asset, new AttributeModifications().Prepend()));
		}
		GetProperty(name: string): Property | undefined {
			return this.m_properties.find((item) => item.Name == name);
		}

		AddAPISchemas(schemas: SchemaType) {
			let attr = this.m_metadatas.find((item) => item.Name == "apiSchemas");
			if (attr == undefined) {
				attr = this.AddMetadata(new Metadata("apiSchemas", [], DataType.Token, new Usd.AttributeModifications().Prepend()));
			}
			attr.Value.push(String(schemas));
		}

		AddChild(obj: BaseObject) {
			this.m_children.push(obj);
			let newone = this.m_children[this.m_children.length - 1];
			newone.m_parent = this;
			return newone;
		}

		GenerateSdfPath(): SdfPath {
			if (this.m_parent == null) {
				return new SdfPath(this.m_name);
			} else {
				return this.m_parent.GenerateSdfPath().AddChild(this.m_name);
			}
		}

		ToString(): string[] {
			let metadatas = this.m_metadatas.map(item => indent + item.ToString()[0]);

			let properties: string[] = [];
			for (var i = 0; i < this.m_properties.length; i++) {
				properties.push(...this.m_properties[i].ToString().map(item => indent + item));
			}

			let childrens: string[] = [];
			for (var i = 0; i < this.m_children.length; i++) {
				childrens.push(...this.m_children[i].ToString().map(item => indent + item));
			}

			let nameString: string = this.m_name == "" ? "" : ` "${this.m_name}"`

			let ret = [
				`def ${this.m_type}${nameString}`,
			];
			if (metadatas.length > 0) {
				ret[ret.length - 1] = ret[ret.length - 1] + " (";
				ret.push(...metadatas);
				ret.push(")");
			}
			ret.push("{");
			ret.push(...properties);
			ret.push(...childrens);
			ret.push("}");
			return ret;
		}
	}

	export class Document implements ICanGenerateSdfPath {
		protected m_filename: string;
		protected m_version: string = "1.0";
		protected m_stage: Stage;
		protected m_metadatas: Metadata[] = [];
		private constructor(filename: string, stage: Stage) { /* friend function shared by Stage */
			this.m_filename = filename;
			this.m_stage = stage;
		}

		GenerateSdfPath(): SdfPath {
			return new SdfPath();
		}

		AddMetadata(metadata: Metadata) {
			this.m_metadatas.push(metadata);
			let newone = this.m_metadatas[this.m_metadatas.length - 1];
			(newone as any).m_belongTo = this;
			return newone;
		}

		SetDoc(doc: string) {
			return this.AddMetadata(new Usd.Metadata("doc", doc, Usd.DataType.Token));
		}

		ToString(): string[] {
			let ret = [
				`#usda ${this.m_version}`
			];

			let metadatas = this.m_metadatas.map(item => "\t" + item.ToString()[0]);
			if (metadatas.length > 0) {
				ret.push("(");
				ret.push(...metadatas);
				ret.push(")");
			}

			let stage = this.m_stage.ToString();
			ret.push(...stage);
			return ret;
		}
	}
	
	export class Stage implements ICanGenerateSdfPath {
		protected m_children: BaseObject[] = [];
		protected m_document: Document;
		constructor(filename: string) {
			this.m_document = new (Document as any)(filename, this);
		}
		GenerateSdfPath(): SdfPath {
			return this.m_document.GenerateSdfPath();
		}
		AddChild(child: BaseObject) {
			this.m_children.push(child);
			return this.m_children[this.m_children.length - 1];
		}
		GetRootLayer() {
			return this.m_document;
		}
		ToString(): string[] {
			let ret: string[] = [];
			for (var i = 0; i < this.m_children.length; i++) {
				var child = this.m_children[i].ToString();
				ret.push(...child);
			}
			return ret;
		}
	}
}

export namespace Usd {
	export class BaseShader extends Usd.BaseObject {
		protected m_outputs: Property[] = [];
		protected constructor(name: string, outputName: string, outputType: DataType) {
			super(NodeType.Shader, name);
			this.addOutput(outputName, outputType);
		}

		addOutput(outputName: string, outputType: DataType) {
			let output = this.AddProperty(new Property(`outputs:${outputName}`, null, outputType, new AttributeModifications().EmptyValue()));
			this.m_outputs.push(output);
			return this.m_outputs[this.m_outputs.length - 1];
		}

		GetOutputs() {
			return this.m_outputs;
		}
	}

	export enum ImageWrapMode {
		Repeat = "repeat",
	}

	export enum ImageSourceColorSpace {
		sRGB = "sRGB",
	}

	export class ImageShader extends BaseShader {
		constructor(name: string, outputName: string = "rgb", alphaName?: string) {
			super(name, outputName, DataType.Float3);
			if (alphaName) {
				this.addOutput(alphaName, DataType.Float);
			}
			this.AddProperty(new Property("info:id", "UsdUVTexture", DataType.Token, new AttributeModifications().Uniform()));
		}

		SetFile(file: string) {
			return this.AddProperty(new Property("inputs:file", file, DataType.Asset));
		}
		SetWrapS(mode: ImageWrapMode = ImageWrapMode.Repeat) {
			return this.AddProperty(new Property("inputs:wrapS", String(mode), DataType.Token));
		}
		SetWrapT(mode: ImageWrapMode = ImageWrapMode.Repeat) {
			return this.AddProperty(new Property("inputs:wrapT", String(mode), DataType.Token));
		}
		SetUVMapping(mapping: Usd.Property) {
			return this.AddProperty(new Property("inputs:st", mapping, DataType.Float2, new AttributeModifications().RefLink(true, false)));
		}
	}

	export class UVMapShader extends BaseShader {
		constructor(name: string, outputName: string = "result") {
			super(name, outputName, DataType.Float2);
			this.AddProperty(new Property("info:id", "UsdPrimvarReader_float2", DataType.Token, new AttributeModifications().Uniform()));
		}
		SetVarName(varName: string = "UVMap") {
			return this.AddProperty(new Property("inputs:varname", varName, DataType.Token));
		}
	}
	
	export class PBRShader extends BaseShader {
		constructor(name: string, outputName: string = "surface") {
			super(name, outputName, DataType.Token);
			this.AddProperty(new Property("info:id", "UsdPreviewSurface", DataType.Token, new AttributeModifications().Uniform()));
		}

		SetSpecular(value: number | Usd.Property) {
			if (typeof value === "number") {
				return this.AddProperty(new Property("inputs:specular", value, DataType.Float));
			} else {
				return this.AddProperty(new Property("inputs:specular.connect", value, DataType.Float, new AttributeModifications().RefLink(true, false)));
			}
		}

		SetDiffuse(value: Point3 | Usd.Property) {
			if (value instanceof Point3) {
				return this.AddProperty(new Property("inputs:diffuseColor", value, DataType.Color3f));
			} else {
				return this.AddProperty(new Property("inputs:diffuseColor.connect", value, DataType.Color3f, new AttributeModifications().RefLink(true, false)));
			}
		}

		SetNormal(value: Point3 | Usd.Property) {
			if (value instanceof Point3) {
				return this.AddProperty(new Property("inputs:normal", value, DataType.Float3));
			} else {
				return this.AddProperty(new Property("inputs:normal.connect", value, DataType.Float3, new AttributeModifications().RefLink(true, false)));
			}
		}

		SetRoughness(value: number | Usd.Property) {
			if (typeof value === "number") {
				return this.AddProperty(new Property("inputs:roughness", value, DataType.Float));
			} else {
				return this.AddProperty(new Property("inputs:roughness.connect", value, DataType.Float, new AttributeModifications().RefLink(true, false)));
			}
		}
	}

	export class Material extends Usd.BaseObject {
		constructor(name: string) {
			super(NodeType.Material, name);
		}
		AddChild(obj: BaseShader): BaseShader {
			return super.AddChild(obj) as BaseShader;
		}
		SetOutputSurface(value: Usd.Property) {
			return this.AddProperty(new Property("outputs:surface.connect", value, DataType.Token, new AttributeModifications().RefLink(true, false)));
		}
	}
}

export namespace Usd.Geom {

	export enum XformOp {
		Translate = "xformOp:translate",
		RotateX = "xformOp:rotateX",
		RotateY = "xformOp:rotateY",
		RotateZ = "xformOp:rotateZ",
		Scale = "xformOp:scale",
		Transform = "xformOp:transform",
	}

	export class Xformable extends BaseObject {
		SetRotateXYZInEulerAngle(x: number, y: number, z: number) {
			return this.AddProperty(new Property("xformOp:rotateXYZ", new Point3(x, y, z), Usd.DataType.Float3));
		}
		SetScale(x: number, y: number, z: number) {
			return this.AddProperty(new Property("xformOp:scale", new Point3(x, y, z), Usd.DataType.Float3));
		}
		SetTranslate(x: number, y: number, z: number) {
			return this.AddProperty(new Property("xformOp:translate", new Point3(x, y, z), Usd.DataType.Float3d));
		}
		SetRotateX(x: number) {
			return this.AddProperty(new Property("xformOp:rotateX", x, Usd.DataType.Float));
		}
		SetRotateY(y: number) {
			return this.AddProperty(new Property("xformOp:rotateY", y, Usd.DataType.Float));
		}
		SetRotateZ(z: number) {
			return this.AddProperty(new Property("xformOp:rotateZ", z, Usd.DataType.Float));
		}
		SetXformOpOrder(op: XformOp[], isUniform: boolean = false) {
			return this.AddProperty(new Property("xformOpOrder", op.map(item => String(item)), Usd.DataType.Token, new AttributeModifications().Uniform(isUniform)));
		}
		SetTransform(matrix: Matrix4) {
			return this.AddProperty(new Property("xformOp:transform", matrix, Usd.DataType.Matrix4d));
		}
	}

	export class Xform extends Xformable {
		constructor(name: string) {
			super(NodeType.Xform, name);
		}
	}

	export class FaceIndices {
		Data: number[];
		constructor(...data: number[]) {
			this.Data = data;
		}
	}

	export enum ColorInterpolation {
		Unset,
		Constant = "constant",
	}

	export enum Interpolation {
		Unset,
		FaceVarying = "faceVarying",
		Vertex = "vertex",
		Uniform = "uniform",
	}

	export class Mesh extends Xformable {
		private logging: IM_Logging = new IM_Logging("Usd.Geom.Mesh");

		constructor(name: string) {
			super(NodeType.Mesh, name);
		}

		SetExtent(min: Point3, max: Point3) {
			return this.AddProperty(new Property("extent", [min, max], Usd.DataType.Float3));
		}

		SetFaceVertexIndices(indices: FaceIndices[]) {
			let counts = indices.map(item => item.Data.length);
			// let datas = indices.reduce(function (previousValue, currentValue) {
			//     return [...previousValue, ...currentValue.Data];
			// }, [] as number[]);
			let datas: number[] = [];
			for (var i = 0; i < indices.length; i++) {
				datas = datas.concat(indices[i].Data);
			}
			// console.debug(datas);

			return [
				this.AddProperty(new Property("faceVertexCounts", counts, Usd.DataType.Int)),
				this.AddProperty(new Property("faceVertexIndices", datas, Usd.DataType.Int)),
			];
		}

		SetPoints(points: Point3[]) {
			return this.AddProperty(new Property("points", points, Usd.DataType.Point3f));
		}

		SetDisplayColor(color: Point3[], interpolation: ColorInterpolation) {
			let prop = this.AddProperty(new Property("primvars:displayColor", color, Usd.DataType.Color3f));
			if (interpolation != ColorInterpolation.Unset) {
				prop.AddMetadata(new Metadata("interpolation", String(interpolation), DataType.Token));
			}
			return prop;
		}

		SetNormal(normal: Point3[], interpolation: Interpolation) {
			let prop = this.AddProperty(new Property("normals", normal, Usd.DataType.Normal3f));
			if (interpolation!= Interpolation.Unset) {
				prop.AddMetadata(new Metadata("interpolation", String(interpolation), DataType.Token));
			}
			return prop;
		}

		SetUV(uv: Point2[], interpolation: Interpolation) {
			let prop = this.AddProperty(new Property("primvars:UVMap", uv, Usd.DataType.TexCoord2f));
			if (interpolation!= Interpolation.Unset) {
				prop.AddMetadata(new Metadata("interpolation", String(interpolation), DataType.Token));
			}
			return prop;
		}

		SetDoubleSide(value: boolean = true, isUniform: boolean = true) {
			return this.AddProperty(new Property("doubleSided", value, Usd.DataType.Bool));
		}

		SetColor(color: Point4[], interpolation: Interpolation) {
			this.logging.Warning("OpenUSD doesn't support alpha value in vertex color. SetColor() will truncate it into color3f.");

			let color3 = color.map(c => new Point3(c.X, c.Y, c.Z));
			let prop = this.AddProperty(new Property("primvars:Color", color3, Usd.DataType.Color3f));
			if (interpolation!= Interpolation.Unset) {
				prop.AddMetadata(new Metadata("interpolation", String(interpolation), DataType.Token));
			}
			return prop;
		}

		SetMaterial(material: Material) {
			return this.AddProperty(new Property("material:binding", material, Usd.DataType.Token, new AttributeModifications().RefLink(true, true)));
		}

		/* Skel */

		SetSkelGeomBindTransform(value: Matrix4) {
			return this.AddProperty(new Property("primvars:skel:geomBindTransform", value, DataType.Matrix4d));
		}
		SetSkelJointIndices(value: number[], interpolation: Interpolation = Interpolation.Unset, elementSize?: number) {
			let prop = this.AddProperty(new Property("primvars:skel:jointIndices", value, DataType.Int));
			if (interpolation != Interpolation.Unset) {
				prop.AddMetadata(new Metadata("interpolation", String(interpolation), DataType.Token));
			}
			if (elementSize!== undefined) {
				prop.AddMetadata(new Metadata("elementSize", elementSize, DataType.Int));
			}
			return prop;
		}
		SetSkelJointWeights(value: number[], interpolation: Interpolation = Interpolation.Unset, elementSize?: number) {
			let prop = this.AddProperty(new Property("primvars:skel:jointWeights", value, DataType.Float));
			if (interpolation != Interpolation.Unset) {
				prop.AddMetadata(new Metadata("interpolation", String(interpolation), DataType.Token));
			}
			if (elementSize!== undefined) {
				prop.AddMetadata(new Metadata("elementSize", elementSize, DataType.Int));
			}
			return prop;
		}
		SetSkeleton(skeleton: Usd.Skel.Skeleton) {
			return this.AddProperty(new Property("skel:skeleton", skeleton, Usd.DataType.Token, new AttributeModifications().RefLink(true, true)));
		}


		//texCoord2f[] primvars:UVMap
		//color3f[] primvars:Attribute
		//bool[] primvars:sharp_face
		//uniform token subdivisionScheme = "none"
	}
}

export namespace Usd.Skel {
	export class Animation extends Usd.BaseObject {
		constructor(name: string) {
			super(NodeType.Skeleton, name);
		}
		SetBindTransforms(value: Usd.Matrix4) {
			return this.AddProperty(new Property("bindTransforms", value, Usd.DataType.Matrix4d, new AttributeModifications().Uniform()));
		}
		SetJointNames(value: string[]) {
			return this.AddProperty(new Property("joints", value, DataType.Token, new AttributeModifications().Uniform()));
		}
		SetRestTransforms(value: Usd.Matrix4) {
			return this.AddProperty(new Property("restTransforms", value, Usd.DataType.Matrix4d, new AttributeModifications().Uniform()));
		}
	}

	export class SkelRoot extends Usd.Geom.Xformable {
		constructor(name:string) {
			super(NodeType.SkelRoot, name);
		}
	}

	export class Skeleton extends Usd.BaseObject {
		constructor(name: string) {
			super(NodeType.Skeleton, name);
		}
		SetBindTransforms(value: Usd.Matrix4) {
			return this.AddProperty(new Property("bindTransforms", value, Usd.DataType.Matrix4d, new AttributeModifications().Uniform()));
		}
		SetJointNames(value: string[]) {
			return this.AddProperty(new Property("joints", value, DataType.Token, new AttributeModifications().Uniform()));
		}
		SetRestTransforms(value: Usd.Matrix4) {
			return this.AddProperty(new Property("restTransforms", value, Usd.DataType.Matrix4d, new AttributeModifications().Uniform()));
		}
	}
}

export namespace Usd.Test {
	export function BasicUsage() {
		let stage = new Usd.Stage("helloworld.usda");
		let root = stage.AddChild(new Usd.Geom.Xform("root")) as Usd.Geom.Xform;
		let mesh = root.AddChild(new Usd.Geom.Mesh("Plane")) as Usd.Geom.Mesh;
		let meta = new Usd.Metadata("active", true, Usd.DataType.Bool);
		mesh.AddMetadata(meta);
		let prop = new Usd.Property("extent", [
			new Usd.Point3(-1, -1, 0),
			new Usd.Point3(1, 1, 0)
		], Usd.DataType.Float3);
		mesh.AddProperty(prop);
		mesh.AddProperty(new Usd.Property("primvars:skel:jointWeights", [1, 1, 1, 1], Usd.DataType.Float))
			.AddMetadata(new Usd.Metadata("elementSize", 1, Usd.DataType.Int))
			.AddMetadata(new Usd.Metadata("interpolation", "vertex", Usd.DataType.Token));
	
		let box = root.AddChild(new Usd.Geom.Mesh("box")) as Usd.Geom.Mesh;
		box.SetExtent(new Usd.Point3(-1.0, -1.0, -1.0), new Usd.Point3(1.0, 1.0, 1.0));
		box.SetFaceVertexIndices([
			new Usd.Geom.FaceIndices(0, 1, 3, 2), new Usd.Geom.FaceIndices(2, 3, 5, 4),
			new Usd.Geom.FaceIndices(4, 5, 7, 6), new Usd.Geom.FaceIndices(6, 7, 1, 0),
			new Usd.Geom.FaceIndices(1, 7, 5, 3), new Usd.Geom.FaceIndices(6, 0, 2, 4),
		])
		box.SetPoints([
			new Usd.Point3(-1.0, -1.0, -1.0), new Usd.Point3(1.0, -1.0, -1.0),
			new Usd.Point3(-1.0, -1.0, 1.0), new Usd.Point3(1.0, -1.0, 1.0),
			new Usd.Point3(-1.0, 1.0, 1.0), new Usd.Point3(1.0, 1.0, 1.0),
			new Usd.Point3(-1.0, 1.0, -1.0), new Usd.Point3(1.0, 1.0, -1.0),
		])
		box.SetDisplayColor([new Usd.Point3(0.5, 0.5, 0.5)], Usd.Geom.ColorInterpolation.Constant);
	
		// box.AddMetadata(new Usd.Metadata("references", "box.usda", Usd.DataType.Token));
		// box.AddProperty(new Usd.Property("xformOpOrder", ["xformOp:translate"], Usd.DataType.Token, true));
		// box.AddProperty(new Usd.Property("xformOp:translate", new Usd.Point3(-1, 0, 0), Usd.DataType.Float3d));
		box.SetReferenceFile("box.usda", true);
		box.SetTranslate(-1, 0, 0);
		box.SetXformOpOrder([
			Usd.Geom.XformOp.Translate,
			Usd.Geom.XformOp.RotateZ,
			Usd.Geom.XformOp.RotateY,
			Usd.Geom.XformOp.RotateX,
			Usd.Geom.XformOp.Scale,
		], true);
	
		let material = stage.AddChild(new Usd.Material("Material_001")) as Usd.Material;
		let shader2 = material.AddChild(new Usd.ImageShader("Image_Texture")) as Usd.ImageShader;
		shader2.SetFile("./textures/3.jpg");
		let shader1 = material.AddChild(new Usd.PBRShader("Principled_BSDF")) as Usd.PBRShader;
		shader1.SetSpecular(0.5);
		shader1.SetDiffuse(shader2.GetOutputs()[0]);
	
		box.SetMaterial(material);
	
		let doc = stage.GetRootLayer();
		doc.SetDoc("Example");
		console.debug(doc.ToString().join("\r\n"));
	}
}