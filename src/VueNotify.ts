import {
	defineComponent,
	h,
	ref,
	Teleport,
	toRef,
	Transition,
	TransitionGroup,
	watch,
	type PropType,
} from 'vue';
import { useReceiver } from './useReceiver';
import { useReceiverStyles } from './useReceiverStyles';
import { calcOrigin, mergeOptions } from './utils';
import { FIXED_INCREMENT, Status } from './constants';
import { defaultComponent } from './defaultComponent';
import type { ComponentProps as Props, UserOptionsWithInternals, Notification } from './types';

export const VueNotify = defineComponent({
	name: 'VueNotify',
	inheritAttrs: false,
	props: {
		key: {
			type: String as PropType<Props['key']>,
			default: '',
		},
		method: {
			type: String as PropType<Props['method']>,
			default: 'unshift',
		},
		limit: {
			type: Number as PropType<Props['limit']>,
			default: 10,
		},
		pauseOnHover: {
			type: Boolean as PropType<Props['pauseOnHover']>,
			default: true,
		},
		margin: {
			type: Object as PropType<Props['margin']>,
			default: () => ({ y: 30, x: 30 }),
		},
		maxWidth: {
			type: Number as PropType<Props['maxWidth']>,
			default: 1280,
		},
		placement: {
			type: String as PropType<Props['placement']>,
			default: 'top-right',
		},
		options: {
			type: Object as PropType<Props['options']>,
			default: () => ({}),
		},
		transitionName: {
			type: String as PropType<Props['transitionName']>,
			default: 'VueNotify',
		},
	},
	setup(props) {
		const placement = toRef(props, 'placement');
		const margin = toRef(props, 'margin');
		const maxWidth = toRef(props, 'maxWidth');

		const isHovering = ref(false);

		const { notifications, incoming } = useReceiver(props.key);
		const { wrapperStyles, containerStyles, hoverAreaStyles } = useReceiverStyles({
			margin,
			maxWidth,
			placement,
		});

		// Watchers

		watch(incoming, (_options) => {
			if (
				notifications.length >= props.limit &&
				notifications[notifications.length - 1].type !== Status.PROMISE
			) {
				notifications[props.method === 'unshift' ? 'pop' : 'shift']();
			}

			let customRender: Pick<Notification, 'userProps' | 'component' | 'renderFn'> = {
				component: undefined,
				userProps: {},
				renderFn: undefined,
			};

			const options = mergeOptions(_options.type, props.options, _options);
			const createdAt = performance.now();

			if (options.type.includes('promise-')) {
				const currIndex = notifications.findIndex((data) => data.id === options.id);
				const prevComponent = notifications[currIndex]?.component;

				if (prevComponent) {
					const { title, message, type, close, ...prevProps } = notifications[currIndex].userProps;

					const nextProps = {
						...getNotifyProps(options),
						prevProps,
					};

					customRender = {
						userProps: options.render?.props?.(nextProps) ?? {},
						component: options.render?.component ?? prevComponent,
						renderFn: () =>
							h(customRender.component ?? {}, {
								...customRender.userProps,
								key: options.id,
							}),
					};
				}

				notifications[currIndex] = {
					...notifications[currIndex],
					...options,
					...customRender,
					timeoutId: isHovering.value ? undefined : createTimeout(options.id, options.duration),
					createdAt,
				};
			} else {
				if (options.render?.component) {
					customRender = {
						userProps: options.render?.props?.(getNotifyProps(options)) ?? {},
						component: options.render.component,
						renderFn: () =>
							h(customRender.component ?? {}, {
								...customRender.userProps,
								key: options.id,
							}),
					};
				}

				notifications[props.method]({
					...options,
					...customRender,
					timeoutId:
						options.type === Status.PROMISE
							? undefined
							: createTimeout(options.id, options.duration),
					clear: () => clear(options.id),
					createdAt,
				} as Notification);
			}
		});

		watch(
			() => notifications.length === 0,
			(newLen) => newLen && (isHovering.value = false),
			{ flush: 'post' }
		);

		// Fns

		function clear(id: string) {
			const index = notifications.findIndex((data) => data.id === id);
			notifications.splice(index, 1);
		}

		function createTimeout(id: string, time: number) {
			return setTimeout(() => {
				notifications.find((data) => data.id === id)?.clear();
			}, time);
		}

		function getNotifyProps({ title, message, type, id }: UserOptionsWithInternals) {
			return { notifyProps: { title, message, type, close: () => clear(id) } };
		}

		const pointerEvts = {
			onPointerenter() {
				if (notifications.length > 0 && !isHovering.value) {
					isHovering.value = true;

					const stoppedAt = performance.now();

					notifications.forEach((prevData, currIndex) => {
						clearTimeout(notifications[currIndex].timeoutId);

						notifications[currIndex] = {
							...prevData,
							stoppedAt,
							elapsed: stoppedAt - prevData.createdAt + (prevData.elapsed ?? 0),
						};
					});
				}
			},
			onPointerleave() {
				if (notifications.length > 0 && isHovering.value) {
					notifications.forEach((prevData, currIndex) => {
						const newTimeout = prevData.duration + FIXED_INCREMENT - prevData.elapsed;

						notifications[currIndex] = {
							...prevData,
							createdAt: performance.now(),
							timeoutId:
								prevData.type !== Status.PROMISE
									? createTimeout(prevData.id, newTimeout)
									: undefined,
						};
					});

					isHovering.value = false;
				}
			},
		};

		return () =>
			h(Teleport, { to: 'body' }, [
				h(
					Transition,
					{
						name: 'VNRoot',
						onEnter(el) {
							(el as HTMLElement).style.transformOrigin = calcOrigin(el as HTMLElement, placement);
						},
					},
					() =>
						notifications.length > 0 && [
							h('div', { style: wrapperStyles }, [
								h('div', { style: containerStyles.value }, [
									h(
										'div',
										{
											style: hoverAreaStyles,
											...(props.pauseOnHover ? pointerEvts : {}),
											...(props.key ? { 'data-vuenotify-key': props.key } : {}),
										},
										[
											h(TransitionGroup, { name: 'VNList' }, () =>
												notifications.map(
													(notification) =>
														notification.renderFn?.() ?? defaultComponent(notification)
												)
											),
										]
									),
								]),
							]),
						]
				),
			]);
	},
});
