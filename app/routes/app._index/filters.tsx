import { Button, Dialog, DialogTrigger, Heading, Label, Popover, Slider, SliderOutput, SliderThumb, SliderTrack } from "react-aria-components";
import { LuSlidersHorizontal } from "react-icons/lu";

interface FiltersData {
	minScore: number;
}

interface FiltersProps {
	onFilterUpdate: (filter: FiltersData) => void;
}

export const Filters = (props: FiltersProps) => {
	return (
		<DialogTrigger>
			<Button>
				<LuSlidersHorizontal className="size-5 text-black" />
			</Button>
			<Popover>
				<Dialog className="rounded-md border bg-white p-4 text-center outline-none">
					<Heading>Filters</Heading>
					<Slider className="w-64" defaultValue={0} onChange={(val) => props.onFilterUpdate({ minScore: val })}>
						<div className="flex w-full justify-between text-black">
							<Label>Minimum Score</Label>
							<SliderOutput />
						</div>
						<SliderTrack className="relative h-7 w-full">
							{({ state }) => (
								<>
									<div className="absolute top-[50%] h-2 w-full translate-y-[-50%] rounded-full bg-gray-200" />
									<div
										className="absolute top-[50%] h-2 translate-y-[-50%] rounded-full bg-gray-700 duration-75"
										style={{ width: `${state.getThumbPercent(0) * 100}%` }}
									/>
									<SliderThumb className="top-[50%] h-5 w-3 rounded-sm border border-solid bg-gray-600 outline-none ring-black transition duration-75 focus-visible:ring-2" />
								</>
							)}
						</SliderTrack>
					</Slider>
				</Dialog>
			</Popover>
		</DialogTrigger>
	);
};
