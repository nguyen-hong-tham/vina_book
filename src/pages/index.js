import Hello from '@/components/hello'
const Home = () => {
  console.log('Hello world')
  return (
    <main>
    <div className="text-8xl underline">Hello</div>
    <Hello />
    </main>
  )
}
export default Home