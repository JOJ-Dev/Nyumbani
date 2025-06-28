import { useState } from "react"
import { useEffect } from "react"

const Login = () => {
    const [Email, setEmail] = useState('');
    const [FirstName, setFirstName] = useState('');
    const [LastName, setLastName] = useState('');
    const [PhoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');

    return(
        <Text mb='20px' color='gray.700' fontSize='44px' fontWeight='bold'>Login</Text>
            <FormControl mb='20px'>
                <FormLabel>Username</FormLabel>
                <Input bg='white' onChange={(e) => setUsername(e.target.value)} value={username} type='email' placeholder='Your username here' />
            </FormControl>
    );
};

export default Login;