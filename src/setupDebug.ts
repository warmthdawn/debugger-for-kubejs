
'use strict';

import * as vscode from 'vscode';
import { WorkspaceFolder, WorkspaceConfiguration, DebugConfiguration, ProviderResult, CancellationToken, ExtensionContext } from 'vscode';
import { DebugAdapterDescriptor, DebugAdapterDescriptorFactory, DebugAdapterExecutable, DebugAdapterServer, DebugSession } from 'vscode';


export function setupDebug(context: ExtensionContext, config: WorkspaceConfiguration) {
	context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('kubejs', new KubeJSConfigurationProvider()));
	context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('kubejs', new KubeJSDebugAdapterDescriptorFactory()));

}

export class KubeJSDebugAdapterDescriptorFactory implements DebugAdapterDescriptorFactory {
	constructor() { }
	public async createDebugAdapterDescriptor(_session: DebugSession,
		_executable: DebugAdapterExecutable): Promise<DebugAdapterDescriptor> {
		const { hostName, port } = _session.configuration;
		return new DebugAdapterServer(port, hostName);
	}
}



export class KubeJSConfigurationProvider implements vscode.DebugConfigurationProvider {

	/**
	 * Massage a debug configuration just before a debug session is being launched,
	 * e.g. add all missing attributes to the debug configuration.
	 */
	resolveDebugConfiguration(folder: WorkspaceFolder | undefined, config: DebugConfiguration, token?: CancellationToken): ProviderResult<DebugConfiguration> {

		if(!folder) {
			return Promise.reject("You must do this in a workspace!");
		}
		if (!config.type && !config.request && !config.name) {
			const editor = vscode.window.activeTextEditor;
			if (editor && editor.document.languageId === 'javascript') {
				return new Promise((resolve, reject) => {
					vscode.window.showInputBox({
						title: 'Please enter the port of debugger: ',
						value: '8000',
						validateInput: (value) => parseInt(value) < 65536 ? '' : 'Must be a valid port'
					}).then(input => {

						config.type = 'kubejs';
						config.name = 'Attach';
						config.request = 'attach';
						config.hostName = 'localhost';
						config.port = input ? parseInt(input) : 8000;
						config.timeout = 1000;


						resolve(config);

					}, err => reject(err));


				});
			}
		}
		return config;
	}
}
