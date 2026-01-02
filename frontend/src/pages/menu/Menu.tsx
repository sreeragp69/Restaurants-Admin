import { 
  Carousel, 
  CarouselContent, 
  CarouselItem
} from '../../components/ui/carousel'

const Menu = () => {
  // Dummy category data
  const categories = [
    { id: 1, name: 'Bakery',     },
    { id: 2, name: 'Burger',     },
    { id: 3, name: 'Beverage',     },
    { id: 4, name: 'Chicken',     },
    { id: 5, name: 'Pizza',     },
    { id: 6, name: 'Salad',     },
    { id: 7, name: 'Dessert',     },
    { id: 8, name: 'Drink',     },
    { id: 9, name: 'Dinner',     },
    { id: 10, name: 'Lunch',     },
  ]

  return (
    <div className="p-6 w-full overflow-hidden">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Category</h1>
      <div className="relative w-full ">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-[calc(100%-16px)]"
        >
          <CarouselContent className="-ml-0">
            {categories.map((category) => (
              <CarouselItem key={category.id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200 text-center">
                    {category.name}
                  </h2>
                 
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </div>
  )
}

export default Menu