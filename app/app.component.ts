import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HostListener } from '@angular/core';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})

//define paras
var elasticpdf_viewer:any = null;
var elasticpdf_iframe:any = null;

export class AppComponent {
	language:any = 'zh-cn';
	// language:any = 'en';
	is_elasticpdf:any=false;
	
	initialPDFEditor() {
		console.log('pdf editor 加载完成');
		elasticpdf_iframe = document.getElementById('elasticpdf-iframe') as HTMLIFrameElement;
		let pdf_url = "compressed.tracemonkey-pldi-09.pdf" as string;
		let is_elasticpdf=false as boolean;
		if (is_elasticpdf === true) {
			pdf_url = "tutorial.pdf";
		}
		if (elasticpdf_iframe && elasticpdf_iframe.contentWindow) {
			elasticpdf_viewer = elasticpdf_iframe?.contentWindow as any;
			if (elasticpdf_viewer?.initialApp) {
				elasticpdf_viewer?.initialApp({
					// 'language': 'zh-cn', // 交互语言
					'language': 'en', // 交互语言
					'pdf_url': pdf_url,
					'member_info': { //用户信息
						'id': 'elasticpdf_id',
						'name': 'elasticpdf',
					},
				});
			} else {
				console.error('未找到函数 not found');
			}

		}
	}

	outputAnnotations() {
		var this_data = elasticpdf_viewer.pdfAnnotation.outputAnnotations();
		var content = JSON.stringify(this_data['file_annotation']);
		console.log('导出批注',content);
	}

	openOrCloseAnnotatioList(){
		elasticpdf_viewer.editAnnotation();
	}

	getPDFData() {
		elasticpdf_viewer.getPDFData();
	}

	@HostListener('window:message', ['$event'])
	onMessage(event : Event) : void {
		const e : any = event;
		if (e.data.source != 'elasticpdf') {
			return;
		}
		
		// pdf 加载结束的回调，可以在此处导入服务器上储存的批注文件
		if (e.data.function_name == 'pdfLoaded') {
			console.log('Angular PDF加载成功');
			this.reloadData();
		}
		
		// 接收pdf数据
		if (e.data.function_name == 'downloadPDF') {
			let file_name = e.data.content['file_name'];
			let pdf_blob = e.data.content['pdf_blob'];
			let pdf_base64 = e.data.content['pdf_base64'];
			console.log('PDF信息', pdf_base64);
			// 如果文档没有被编辑过，则 pdf_base64 仍然是文件名
			// 接收到 pdf 数据，其中 pdf_base64 可以快捷上传到服务器
			this.postService('upload-pdf-data', {
				'file_name': file_name,
				'file_id': '123ddasfsdffads',
				'file_data': pdf_base64,
			});
		}
				
		// pdf 批注编辑回调，可以在此处导出批注并传输到服务器
		if (e.data.function_name == 'annotationsModified') {
			// 仅获取 pdf 批注文件，不写入到 pdf 中
			let this_data = elasticpdf_viewer.pdfAnnotation.outputAnnotations();
			let annotation_content = JSON.stringify(this_data['file_annotation']);
			let file_name = this_data['file_name'];
			console.log('批注信息', annotation_content);
			this.postService('upload-annotation-data', {
				'file_name': file_name,
				'file_id': '123ddasfsdffads',
				'file_annotation': annotation_content,
			});
		}
	}
	
	changeFile(){
		var test_pdf='https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf';
		elasticpdf_viewer.pdfAnnotation.refreshFabricState(1);
		elasticpdf_viewer.pdfAnnotation.openFile(test_pdf);
		console.log('pdfurl',elasticpdf_viewer.PDFViewerApplication.baseUrl);
	}
	
	//设置用户
	setUser(id:any) {
		var this_member = {
			'id': id,
			'name': '张三的名字',
		};
		elasticpdf_viewer.setCurrentMemberId(this_member);
	}
	
	
	reloadData() {
		console.log('加载批注');
		// let file_name = 'tutorial.pdf'
		// let annotation_content =this.postService('get-annotation-data', {
		// 	'file_name': 'tutorial.pdf',
		// 	'file_id': '123ddasfsdffads',
		// });
		// // 批注重载回显于当前文件
		// elasticpdf_viewer.setPureFileAnnotation({
		// 	'file_annotation': annotation_content
		// });
	}
	
	
	// 与后端服务器进行网络通信的函数
	postService(url:any, data:any) {
		console.log(url,data);
		return;
	// 	var new_data = new URLSearchParams();
	// 	var encrpte_data = data;
	// 	new_data.append('data', encrpte_data);
	
	// 	var base_url = "your-server-url";
	// 	var posturl = base_url + url;
	// 	const response = await fetch(posturl, {
	// 		method: 'POST',
	// 		headers: {},
	// 		body: new_data,
	// 	});
	
	
	// 	const resp = await response.json();
	// 	resp['data'] = JSON.parse(resp['data']);
	
	// 	return resp;
	}

}